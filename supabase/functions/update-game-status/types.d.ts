// This file suppresses TypeScript errors for Deno imports in VS Code
// The actual Edge Function runs in Deno environment where these imports work perfectly

declare module "https://deno.land/std@0.224.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string): any;
}

// Deno global namespace
declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined;
  }
}
