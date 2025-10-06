// utils/enumHelpers.ts
export function getEnumKeyByValue<T extends { [key: string]: string }>(
    enumObj: T,
    value: string
): keyof T | undefined {
    return Object.entries(enumObj).find(([, enumValue]) => enumValue === value)?.[0] as keyof T | undefined;
}

export function getEnumValueByKey<T extends { [key: string]: string }>(
    enumObj: T,
    key: keyof T
): string | undefined {
    return enumObj[key];
}
