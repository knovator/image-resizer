declare module '@knovator/image-resizer' {
    function middleware(
        req: import('express').Request,
        res: import('express').Response,
        next: import('express').NextFunction
    ): void;
    export function resize(rootFolder: string, config?: configType): middleware;
}

interface configType {
    extensions: string[];
    dimensionsRegex: RegExp;
}
