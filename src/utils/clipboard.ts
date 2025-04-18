import { toast } from "@/hooks/use-toast";

export const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        toast({
            title: "Error",
            description: "Failed to copy to clipboard",
            type: "error"
        });
        return false;
    }
};