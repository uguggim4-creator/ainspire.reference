export interface Classification {
    composition?: string;
    action?: string;
    lighting?: string;
    color?: string;
    setting?: string;
}

export interface ExtractedFrame {
    data: string; // base64 data URL
    timestamp: number;
    sourceName: string;
}

export interface ReferenceImage {
    id: string;
    src: string; // base64 data URL
    classifications: Classification;
    timestamp: number;
    sourceName: string;
}

export type FilterOptions = {
    [K in keyof Classification]?: string[];
};

export type ActiveFilters = {
    [K in keyof Classification]?: string;
};
