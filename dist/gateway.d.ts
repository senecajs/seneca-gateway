type GatewayResult = {
    out: any | {
        meta$: any;
        error$: {
            name: string;
            code?: string;
            message?: string;
            details?: any;
        };
    };
    error: boolean;
    meta?: any;
    gateway$?: Record<string, any>;
};
type GatewayOptions = {
    allow: any;
    custom: any;
    fixed: any;
    error: {
        message: boolean;
        details: boolean;
    };
    debug: boolean;
};
declare function gateway(this: any, options: GatewayOptions): {
    exports: {
        handler: (json: any, ctx: any) => Promise<unknown>;
        parseJSON: (data: any) => any;
    };
};
declare namespace gateway {
    var defaults: {
        allow: any;
        custom: any;
        fixed: any;
        error: {
            message: boolean;
            details: boolean;
        };
        debug: boolean;
    };
}
export type { GatewayOptions, GatewayResult, };
export default gateway;
