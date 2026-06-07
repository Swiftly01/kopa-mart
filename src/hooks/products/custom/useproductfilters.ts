import { useRef, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import useGetCategories from "@/hooks/admin/categories/queries/useGetCategories";
import useStates from "@/hooks/locations/queries/useStates";
import useLgas from "@/hooks/locations/queries/useLgas";

interface FilterValues {
  q: string;
  state: string;
  lga: string;
  category: string;
}

const DEBOUNCE_MS = 400;

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { register, control, setValue, reset } = useForm<FilterValues>({
    defaultValues: {
      q: searchParams.get("q") || "",
      state: searchParams.get("state") || "",
      lga: searchParams.get("lga") || "",
      category: searchParams.get("category") || "",
    },
  });

  const watchedState = useWatch({ control, name: "state" });
  const watchedLga = useWatch({ control, name: "lga" });
  const watchedCategory = useWatch({ control, name: "category" });
  const watchedQ = useWatch({ control, name: "q" });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQ, setDebouncedQ] = useState(searchParams.get("q") || "");

  const commitFilter = (key: keyof FilterValues, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  const handleQChange = (value: string) => {
    setValue("q", value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQ(value);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set("q", value);
        else next.delete("q");
        return next;
      });
    }, DEBOUNCE_MS);
  };

  const handleStateChange = (value: string) => {
    const val = value === "__all__" ? "" : value;
    setValue("state", val);
    setValue("lga", "");
    commitFilter("state", val);
    commitFilter("lga", "");
  };

  const handleLgaChange = (value: string) => {
    const val = value === "__all__" ? "" : value;
    setValue("lga", val);
    commitFilter("lga", val);
  };

  const handleCategoryChange = (value: string) => {
    const val = value === "__all__" ? "" : value;
    setValue("category", val);
    commitFilter("category", val);
  };

  const clearFilters = () => {
    reset({ q: watchedQ, state: "", lga: "", category: "" });
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("state");
      next.delete("lga");
      next.delete("category");
      return next;
    });
  };

  const activeFilters =
    (watchedCategory ? 1 : 0) + (watchedLga ? 1 : 0) + (watchedState ? 1 : 0);

  // Location data
  const { data: statesData } = useStates();
  const states = statesData?.data ?? [];

  const { data: lgasData } = useLgas(watchedState);
  const lgas = lgasData?.data?.lgas ?? [];

  // Category data
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategories();
  const categories = useMemo(
    () => categoriesData?.data ?? [],
    [categoriesData],
  );

  // Add this here
  const category = searchParams.get("category") || "";
  const state = searchParams.get("state") || "";
  const lga = searchParams.get("lga") || "";

  // Query params for the products API
  const queryParams = useMemo(
    () => ({
      ...(debouncedQ.trim() ? { search: debouncedQ.trim() } : {}),
      ...(category ? { categoryId: category } : {}),
      ...(state ? { stateName: state } : {}),
      ...(lga ? { lgaName: lga } : {}),
    }),
    [debouncedQ, category, state, lga],
  );
  return {
    // form
    register,
    control,
    // watched values
    watchedState,
    watchedLga,
    watchedCategory,
    watchedQ,
    debouncedQ,
    // handlers
    handleQChange,
    handleStateChange,
    handleLgaChange,
    handleCategoryChange,
    clearFilters,
    // derived
    activeFilters,
    // data
    states,
    lgas,
    categories,
    isLoadingCategories,
    // api params
    queryParams,
  };
}
