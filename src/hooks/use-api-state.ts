/**
 * Phase 17: API State Management Hooks
 *
 * Consistent patterns for loading/error/empty/offline states across all services.
 */

import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import type { ID } from "@/types/domain";

/* -------------------------------- Load States -------------------------------- */

export type LoadState = "idle" | "loading" | "success" | "empty" | "error" | "offline";

export interface DataState<T> {
  data: T | null;
  state: LoadState;
  error: ServiceError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isEmpty: boolean;
  isError: boolean;
  isOffline: boolean;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
  retryable: boolean;
}

/* -------------------------------- Error Codes -------------------------------- */

export const ERROR_CODES = {
  // Network
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  OFFLINE: "OFFLINE",

  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",
  AUTH_REQUIRED: "AUTH_REQUIRED",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // Authorization
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  AGE_RESTRICTED: "AGE_RESTRICTED",
  PARENT_APPROVAL_REQUIRED: "PARENT_APPROVAL_REQUIRED",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Validation
  INVALID_INPUT: "INVALID_INPUT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // Safety
  CONTENT_FLAGGED: "CONTENT_FLAGGED",
  MODERATION_REQUIRED: "MODERATION_REQUIRED",
  BLOCKED_USER: "BLOCKED_USER",
  INAPPROPRIATE_CONTENT: "INAPPROPRIATE_CONTENT",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  MAINTENANCE_MODE: "MAINTENANCE_MODE",

  // Unknown
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/* -------------------------------- Error Utilities ---------------------------- */

export function isRetryableError(error: ServiceError): boolean {
  return (
    error.code === ERROR_CODES.NETWORK_ERROR ||
    error.code === ERROR_CODES.TIMEOUT ||
    error.code === ERROR_CODES.SERVICE_UNAVAILABLE ||
    error.code === ERROR_CODES.RATE_LIMIT_EXCEEDED
  );
}

export function isAuthError(error: ServiceError): boolean {
  return (
    error.code === ERROR_CODES.UNAUTHORIZED ||
    error.code === ERROR_CODES.AUTH_REQUIRED ||
    error.code === ERROR_CODES.SESSION_EXPIRED
  );
}

export function isAuthorizationError(error: ServiceError): boolean {
  return (
    error.code === ERROR_CODES.FORBIDDEN ||
    error.code === ERROR_CODES.INSUFFICIENT_PERMISSIONS ||
    error.code === ERROR_CODES.AGE_RESTRICTED ||
    error.code === ERROR_CODES.PARENT_APPROVAL_REQUIRED
  );
}

export function isSafetyError(error: ServiceError): boolean {
  return (
    error.code === ERROR_CODES.CONTENT_FLAGGED ||
    error.code === ERROR_CODES.MODERATION_REQUIRED ||
    error.code === ERROR_CODES.BLOCKED_USER ||
    error.code === ERROR_CODES.INAPPROPRIATE_CONTENT
  );
}

export function getUserFriendlyMessage(error: ServiceError): string {
  switch (error.code) {
    case ERROR_CODES.NETWORK_ERROR:
      return "Can't connect right now. Check your internet connection.";
    case ERROR_CODES.TIMEOUT:
      return "This is taking longer than usual. Please try again.";
    case ERROR_CODES.OFFLINE:
      return "You're offline. Some features won't work until you're back online.";

    case ERROR_CODES.UNAUTHORIZED:
    case ERROR_CODES.AUTH_REQUIRED:
      return "You need to sign in to do that.";
    case ERROR_CODES.SESSION_EXPIRED:
      return "Your session expired. Please sign in again.";

    case ERROR_CODES.FORBIDDEN:
    case ERROR_CODES.INSUFFICIENT_PERMISSIONS:
      return "You don't have permission to do that.";
    case ERROR_CODES.AGE_RESTRICTED:
      return "This feature isn't available for your age yet.";
    case ERROR_CODES.PARENT_APPROVAL_REQUIRED:
      return "Ask your parent to approve this first.";

    case ERROR_CODES.NOT_FOUND:
      return "We couldn't find what you're looking for.";
    case ERROR_CODES.ALREADY_EXISTS:
      return "That already exists. Try a different name.";
    case ERROR_CODES.CONFLICT:
      return "Something changed while you were working. Please refresh and try again.";

    case ERROR_CODES.INVALID_INPUT:
    case ERROR_CODES.VALIDATION_ERROR:
    case ERROR_CODES.MISSING_REQUIRED_FIELD:
      return "Please check your input and try again.";

    case ERROR_CODES.RATE_LIMIT_EXCEEDED:
    case ERROR_CODES.TOO_MANY_REQUESTS:
      return "Slow down! Wait a moment and try again.";

    case ERROR_CODES.CONTENT_FLAGGED:
      return "This content needs to be reviewed before sharing.";
    case ERROR_CODES.MODERATION_REQUIRED:
      return "We're checking this to make sure it's safe. This usually takes a few minutes.";
    case ERROR_CODES.BLOCKED_USER:
      return "You can't interact with this user.";
    case ERROR_CODES.INAPPROPRIATE_CONTENT:
      return "This content doesn't follow our safety rules.";

    case ERROR_CODES.INTERNAL_ERROR:
      return "Something went wrong on our end. We're working on it!";
    case ERROR_CODES.SERVICE_UNAVAILABLE:
      return "The service is temporarily unavailable. Please try again soon.";
    case ERROR_CODES.MAINTENANCE_MODE:
      return "We're doing some maintenance. We'll be back soon!";

    default:
      return error.message || "Something went wrong. Please try again.";
  }
}

/* -------------------------------- Query Hook --------------------------------- */

/**
 * Enhanced useQuery with consistent state management
 *
 * Usage:
 * ```tsx
 * const { data, state, error, isLoading, isEmpty } = useApiQuery({
 *   queryKey: queryKeys.learner,
 *   queryFn: learnerService.getCurrent,
 * });
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (isEmpty) return <EmptyState />;
 * if (error) return <ErrorMessage error={error} />;
 * return <LearnerProfile learner={data} />;
 * ```
 */
export function useApiQuery<T>(
  options: UseQueryOptions<T, ServiceError> & {
    emptyCheck?: (data: T) => boolean;
  }
): DataState<T> {
  const { emptyCheck, ...queryOptions } = options;

  const query = useQuery<T, ServiceError>(queryOptions);

  const state: LoadState = query.isLoading
    ? "loading"
    : query.isError
      ? query.error?.code === ERROR_CODES.OFFLINE
        ? "offline"
        : "error"
      : query.isSuccess
        ? emptyCheck && query.data && emptyCheck(query.data)
          ? "empty"
          : "success"
        : "idle";

  return {
    data: query.data ?? null,
    state,
    error: query.error ?? null,
    isLoading: state === "loading",
    isSuccess: state === "success",
    isEmpty: state === "empty",
    isError: state === "error",
    isOffline: state === "offline",
  };
}

/* -------------------------------- Mutation Hook ------------------------------ */

/**
 * Enhanced useMutation with consistent error handling
 *
 * Usage:
 * ```tsx
 * const updateProfile = useApiMutation({
 *   mutationFn: (updates: Partial<LearnerProfile>) =>
 *     learnerService.updateProfile(updates),
 *   onSuccess: () => {
 *     toast.success("Profile updated!");
 *   },
 *   onError: (error) => {
 *     toast.error(getUserFriendlyMessage(error));
 *   },
 * });
 *
 * <Button onClick={() => updateProfile.mutate({ displayName: "New Name" })}>
 *   Save
 * </Button>
 * ```
 */
export function useApiMutation<TData, TVariables>(
  options: UseMutationOptions<TData, ServiceError, TVariables>
) {
  return useMutation<TData, ServiceError, TVariables>(options);
}

/* -------------------------------- List Helpers ------------------------------- */

/**
 * Check if array is empty (for emptyCheck prop)
 */
export function isEmptyArray<T>(data: T[]): boolean {
  return data.length === 0;
}

/**
 * Check if object is empty (for emptyCheck prop)
 */
export function isEmptyObject(data: Record<string, unknown>): boolean {
  return Object.keys(data).length === 0;
}

/* -------------------------------- Retry Logic -------------------------------- */

/**
 * Default retry logic for queries
 */
export function defaultRetry(failureCount: number, error: ServiceError): boolean {
  // Don't retry if not retryable
  if (!isRetryableError(error)) {
    return false;
  }

  // Retry up to 3 times for retryable errors
  return failureCount < 3;
}

/**
 * Calculate retry delay (exponential backoff)
 */
export function getRetryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 30000);
}

/* -------------------------------- Stale Time --------------------------------- */

/**
 * Default stale times for different data types
 */
export const STALE_TIME = {
  /** Data that changes frequently (messages, notifications) */
  REALTIME: 0,
  /** Data that changes occasionally (learner progress, mastery) */
  FREQUENT: 30_000, // 30 seconds
  /** Data that changes rarely (curriculum, characters) */
  STABLE: 5 * 60_000, // 5 minutes
  /** Data that almost never changes (domains, skills definitions) */
  STATIC: 60 * 60_000, // 1 hour
} as const;

/* -------------------------------- Cache Time --------------------------------- */

/**
 * Default cache times (how long to keep unused data)
 */
export const CACHE_TIME = {
  SHORT: 5 * 60_000, // 5 minutes
  MEDIUM: 30 * 60_000, // 30 minutes
  LONG: 60 * 60_000, // 1 hour
  PERSISTENT: Infinity, // Never garbage collect
} as const;

/* -------------------------------- Example Usage ------------------------------ */

/**
 * Example: Fetch learner with loading/error/empty states
 *
 * ```tsx
 * function LearnerProfile() {
 *   const { data: learner, state, error } = useApiQuery({
 *     queryKey: queryKeys.learner,
 *     queryFn: learnerService.getCurrent,
 *     staleTime: STALE_TIME.FREQUENT,
 *     retry: defaultRetry,
 *   });
 *
 *   if (state === "loading") {
 *     return <LoadingSpinner />;
 *   }
 *
 *   if (state === "error") {
 *     return (
 *       <ErrorMessage
 *         message={getUserFriendlyMessage(error)}
 *         retry={error.retryable}
 *       />
 *     );
 *   }
 *
 *   return <div>{learner.profile.displayName}</div>;
 * }
 * ```
 *
 * Example: Fetch list with empty state
 *
 * ```tsx
 * function ProjectList() {
 *   const { data: projects, state, isEmpty } = useApiQuery({
 *     queryKey: queryKeys.projects(),
 *     queryFn: () => projectService.list(),
 *     emptyCheck: isEmptyArray,
 *     staleTime: STALE_TIME.FREQUENT,
 *   });
 *
 *   if (state === "loading") {
 *     return <LoadingSpinner />;
 *   }
 *
 *   if (isEmpty) {
 *     return (
 *       <EmptyState
 *         title="No projects yet"
 *         message="Start your first project!"
 *         action={<Button onClick={createProject}>Create Project</Button>}
 *       />
 *     );
 *   }
 *
 *   return <ProjectGrid projects={projects} />;
 * }
 * ```
 *
 * Example: Mutation with optimistic update
 *
 * ```tsx
 * function UpdateProfileButton() {
 *   const queryClient = useQueryClient();
 *
 *   const updateProfile = useApiMutation({
 *     mutationFn: (updates: Partial<LearnerProfile>) =>
 *       learnerService.updateProfile(updates),
 *     onMutate: async (updates) => {
 *       // Cancel outgoing refetches
 *       await queryClient.cancelQueries(queryKeys.learner);
 *
 *       // Snapshot previous value
 *       const previous = queryClient.getQueryData(queryKeys.learner);
 *
 *       // Optimistically update
 *       queryClient.setQueryData(queryKeys.learner, (old) => ({
 *         ...old,
 *         profile: { ...old.profile, ...updates },
 *       }));
 *
 *       return { previous };
 *     },
 *     onError: (_err, _updates, context) => {
 *       // Rollback on error
 *       queryClient.setQueryData(queryKeys.learner, context.previous);
 *       toast.error("Failed to update profile");
 *     },
 *     onSuccess: () => {
 *       toast.success("Profile updated!");
 *     },
 *     onSettled: () => {
 *       // Refetch after mutation
 *       queryClient.invalidateQueries(queryKeys.learner);
 *     },
 *   });
 *
 *   return (
 *     <Button
 *       onClick={() => updateProfile.mutate({ displayName: "New Name" })}
 *       disabled={updateProfile.isPending}
 *     >
 *       {updateProfile.isPending ? "Saving..." : "Save"}
 *     </Button>
 *   );
 * }
 * ```
 */
