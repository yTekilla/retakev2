/**
 * Implementação semver-ishda versão do Conduit para realizar
 * verificações baseadas na versão
 */

export default class Version {
    public readonly major: number;
    public readonly minor: number;
    public readonly patch: number;

    constructor(version: string) {
        const [major, minor, patch] = version.split(".");

        this.major = +major;
        this.minor = +minor;
        this.patch = +patch;
    }
    greaterThan(major: number, minor: number, patch: number): boolean {
        return this.major > major || this.minor > minor || this.patch > patch;
    }
}