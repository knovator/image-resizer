import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { glob } from 'glob';
import { Request, Response, NextFunction } from 'express';

const config: configType = {
    extensions: ['.png', '.jpg', '.jpeg', '.webp'],
    dimensionsRegex: /\/\d{2,6}x\d{2,6}\//gm,
};

function createDimensionsDirAndUpdatePath(filePath: string): string {
    if (config.dimensionsRegex.test(filePath)) {
        // create dimensions directory
        let dimensionsPath: string[] | string = filePath.split('/');
        dimensionsPath.pop();
        dimensionsPath = dimensionsPath.join('/');
        if (!fs.existsSync(dimensionsPath)) {
            fs.mkdirSync(dimensionsPath, { recursive: true });
        }
        // check if image path has dimensions, remove them
        return filePath.replace(config.dimensionsRegex, '/');
    } else {
        return filePath;
    }
}

async function resizeImage(sourcePath: string, destinationPath: string) {
    let file = fs.readFileSync(sourcePath);
    let dimensions: string | RegExpMatchArray | null = destinationPath.match(
        config.dimensionsRegex
    );

    if (dimensions && dimensions.length > 0) {
        dimensions = dimensions[0].replace(/\//gm, '');

        let [width, height] = dimensions.split('x');
        await sharp(file)
            .resize(+width, +height)
            .toFile(destinationPath);
    } else {
        await sharp(file).toFile(destinationPath);
    }
}

function matchFile(filePath: string) {
    return new Promise<string | null>((resolve, reject) => {
        let globPattern: string =
            filePath.split('.')[0] +
            '.' +
            `{${config.extensions.join(',').replace(/\./g, '')}}`;
        glob(globPattern, {}, (err: Error | null, files: string[]) => {
            if (err) {
                reject(err);
            }
            if (files.length > 0) {
                // image is exists in the same folder with different format
                resolve(files[0]);
            } else {
                resolve(null);
            }
        });
    });
}

function setConfig(newConfig?: Omit<configType, 'dimensionsRegex'>) {
    if (newConfig) {
        if (newConfig.extensions) config.extensions = newConfig.extensions;
    }
}

export function resize(rootFolder: string, newConfig?: configType) {
    setConfig(newConfig);
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            let providedPath = path.join(rootFolder, req.originalUrl);
            let extension = providedPath.split('.')[1];
            if (extension && config?.extensions.includes(`.${extension}`)) {
                if (fs.existsSync(providedPath)) {
                    // image is already exists
                    next();
                } else {
                    // image is not exists
                    let modifiedPath = providedPath;
                    modifiedPath =
                        createDimensionsDirAndUpdatePath(modifiedPath);

                    let filePath = await matchFile(modifiedPath);
                    if (filePath) await resizeImage(filePath, providedPath);
                    next();
                }
            } else {
                next();
            }
        } catch (error) {
            console.log(error);
            next();
        }
    };
}
