export interface Database {
    get: (sql: string, params?: any) => Promise<any>;
    all: (sql: string, params?: any) => Promise<any[]>;
    run: (sql: string, params?: any) => Promise<any>;
    close: () => Promise<void>;
}
export declare function initializeDatabase(): Promise<Database>;
export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
}
export interface Solution {
    id: number;
    user_id: number;
    puzzle_date_id: number;
    equation: string;
    score: number;
    left_value: number;
    right_value: number;
    is_retroactive: boolean;
    created_at: string;
}
export interface PuzzleDate {
    id: number;
    date_string: string;
    date_numbers: string;
    month_length: number;
    day_length: number;
    created_at: string;
}
//# sourceMappingURL=database.d.ts.map