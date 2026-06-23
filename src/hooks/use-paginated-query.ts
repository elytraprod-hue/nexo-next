"use client";

import { useState, useCallback, useEffect } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

interface PaginatedQueryOptions {
  supabase: SupabaseClient | null;
  table: string;
  workspaceId: string;
  select: string;
  orderBy?: string;
  orderAscending?: boolean;
  pageSize?: number;
  filters?: Record<string, unknown>;
}

interface PaginatedResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  loadMore: () => void;
  refresh: () => void;
  totalCount: number;
}

export function usePaginatedQuery<T extends Record<string, unknown>>(
  options: PaginatedQueryOptions
): PaginatedResult<T> {
  const {
    supabase,
    table,
    workspaceId,
    select,
    orderBy = "created_at",
    orderAscending = false,
    pageSize = 20,
    filters = {},
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (!supabase || !workspaceId) {
        setError("Supabase ou workspace não configurado");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Count total
        const countQuery = supabase
          .from(table)
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId);

        // Apply additional filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            countQuery.eq(key, value);
          }
        });

        const { count, error: countError } = await countQuery;

        if (countError) throw countError;
        setTotalCount(count ?? 0);

        // Fetch data
        const from = pageNum * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from(table)
          .select(select)
          .eq("workspace_id", workspaceId)
          .order(orderBy, { ascending: orderAscending })
          .range(from, to);

        // Apply additional filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });

        const { data: rows, error: queryError } = await query.returns<T[]>();

        if (queryError) throw queryError;

        const newData = rows ?? [];
        setHasMore(newData.length === pageSize);

        if (append) {
          setData((prev) => [...prev, ...newData]);
        } else {
          setData(newData);
        }
      } catch (err) {
        console.error(`[usePaginatedQuery] Erro em ${table}:`, err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    },
    [supabase, table, workspaceId, select, orderBy, orderAscending, pageSize, filters]
  );

  // Load initial page
  useEffect(() => {
    setPage(0);
    setData([]);
    fetchPage(0, false);
  }, [workspaceId, table, JSON.stringify(filters), fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, true);
  }, [loading, hasMore, page, fetchPage]);

  const refresh = useCallback(() => {
    setPage(0);
    setData([]);
    fetchPage(0, false);
  }, [fetchPage]);

  return {
    data,
    loading,
    error,
    hasMore,
    page,
    loadMore,
    refresh,
    totalCount,
  };
}
