/** 支払リクエスト（コア → プラグイン）*/
export interface PaymentRequest {
	gateway: string; // "stripe" | "paypal" | ...
	amount: number; // smallest unit (yen ⇒ 円, usd ⇒ cent)
	currency: "JPY" | "USD";
	customerId: string;
}

/** プラグインが返す標準レスポンス */
export interface PaymentResult {
	ok: boolean;
	txId?: string;
	error?: string;
}

/** プラグイン側が実装すべき contract */
export interface PaymentGateway {
	name: string;
	currencies: string[];
	charge(req: PaymentRequest): Promise<PaymentResult>;
}
