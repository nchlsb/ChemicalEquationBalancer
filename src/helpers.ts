export function randomIntegerUpTo(max: number): number {
    const between0and1 = Math.random()
    const floatBetween0andMax = between0and1 * max
    return Math.floor(floatBetween0andMax)
}

export function range(n: number): number[] {
    let retVal: number[] = [];

    for (let i = 0; i < n; i++) {
        retVal.push(i);
    }

    return retVal;
}