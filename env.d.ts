declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TARGET: string;
      OUT: string;
      DEV: 'true' | 'false';
    }
    interface Process {
      env: ProcessEnv;
    }
  }

  type BuildFormat = 'cjs' | 'esm' | 'iife';
}

declare module 'pkg-types' {
  interface PackageBuildOptions {
    name?: string;
    internal?: string[];
  }

  interface PackageJson {
    buildOptions?: PackageBuildOptions;
  }
}

export {};
