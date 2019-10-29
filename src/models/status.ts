export enum Status {
    InvalidSeller,
    InvalidBuyer,
    Success
}

export function getResponseStatus(status: Status): number {
    const statusToCode = new Map(
        [
            [Status.InvalidSeller, 400],
            [Status.InvalidBuyer, 400],
            [Status.Success, 200]
        ]);

    return statusToCode.get(status);
}
