declare module "@aura/core" {
  export const LOCAL_USER_ID: string;
  export type Memory = {
    id: string;
    text: string;
    space: string;
    source: string;
    created_at: string;
    similarity?: number;
  };
  export type Connection = {
    id: string;
    app_name: string;
    allowed_spaces: string[] | null;
    can_write: boolean;
    created_at: string;
    last_used_at: string | null;
    revoked_at: string | null;
  };
  export type Access = {
    id: string;
    userId: string;
    appName: string;
    allowedSpaces: string[] | null;
    canWrite: boolean;
  };
  export function addMemory(a: { text: string; space?: string; source?: string; userId?: string }): Promise<Memory>;
  export function updateMemory(a: { id: string; text: string; userId?: string }): Promise<boolean>;
  export function searchMemory(a: {
    query: string;
    k?: number;
    spaces?: string[] | null;
    minSimilarity?: number;
    userId?: string;
  }): Promise<Memory[]>;
  export function listMemories(a?: { userId?: string }): Promise<Memory[]>;
  export function listSpaces(a?: { userId?: string }): Promise<{ id: string; name: string }[]>;
  export function deleteMemory(id: string, userId?: string): Promise<boolean>;
  export function deleteAllMemories(userId: string): Promise<void>;
  export function createConnection(a: {
    userId: string;
    appName: string;
    allowedSpaces?: string[] | null;
    canWrite?: boolean;
  }): Promise<{ id: string; appName: string; allowedSpaces: string[] | null; canWrite: boolean; token: string }>;
  export function resolveToken(token: string | null | undefined): Promise<Access | null>;
  export function listConnections(a: { userId: string }): Promise<Connection[]>;
  export function revokeConnection(a: { id: string; userId: string }): Promise<boolean>;
  export function exportAll(a: { userId: string }): Promise<{ exported_at: string; spaces: string[]; memories: Memory[] }>;
  export function getDb(): Promise<{
    query(sql: string, params?: unknown[]): Promise<{ rows: any[]; rowCount: number }>;
    close(): Promise<void>;
  }>;
}
