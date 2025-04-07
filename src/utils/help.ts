export const isValidSolanaAddress = (address: string): boolean => {
    // Check if address is exactly 32-44 characters long (to accommodate different address types)
    if (address.length < 32 || address.length > 44) {
        return false;
    }

    // Updated base58 regex to include all valid characters
    const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    if (!base58Regex.test(address)) {
        return false;
    }

    return true;
};