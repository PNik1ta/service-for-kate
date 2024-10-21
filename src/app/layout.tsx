"use client";
import "./globals.css";

import { useEffect, useState } from "react";
import TonConnect, { Wallet } from "@tonconnect/sdk";
import { FRONT_URL } from "../../core/constants/front-url";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [wallet, setWallet] = useState<Wallet | null>(null);
	let tonConnect: TonConnect | null = null
	const [balance, setBalance] = useState<string>()
	const [amount, setAmount] = useState<string>()
	const [receiver, setReceiver] = useState<string>()

	useEffect(() => {
		if (typeof window !== 'undefined') {
			tonConnect = new TonConnect({
				manifestUrl: `${FRONT_URL}/tonconnect-manifest.json`,
			});
			console.log(tonConnect);


			// Следите за изменениями статуса кошелька
			const unsubscribe = tonConnect.onStatusChange((walletInfo) => {
				setWallet(walletInfo);
				console.log('here');

			});

			return () => unsubscribe();
		}
	}, []);

	useEffect(() => {
		if (wallet) {
			fetchBalance(wallet.account.address)
		}

	}, [wallet])

	const handleAmountChange = (e: any) => {
		setAmount(e?.target?.value)
	}

	const handleReceiverChange = (e: any) => {
		setReceiver(e?.target?.value)
	}

	const connectWallet = async () => {
		try {
			const res = await tonConnect?.connect({
				bridgeUrl: 'https://bridge.tonapi.io/bridge',  // Мост для работы с кошельком
				universalLink: 'https://app.tonkeeper.com/ton-connect' // Ссылка на TonKeeper
			});

			if (res) {
				window.location.href = res;
			}
			console.log('connected: ', res);

		} catch (error) {
			console.error('Ошибка подключения:', error);
		}
	};

	const disconnectWallet = () => {
		tonConnect?.disconnect();
		setWallet(null);
	};

	const fetchBalance = async (address: string | undefined) => {
		if (!address) return;

		try {
			const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`);
			const data = await response.json();
			setBalance(data.result);
		} catch (error) {
			console.error('Ошибка получения баланса:', error);
		}
	};

	const sendTransaction = async () => {
		if (!wallet || !amount || !receiver) {
			alert("Пожалуйста, заполните все поля!");
			return;
		}

		try {
			// Преобразование значения amount в нанокоины (TON * 1e9)
			const nanoAmount = BigInt(parseFloat(amount) * 1e9);

			// Параметры транзакции
			const transaction = {
				validUntil: Math.floor(Date.now() / 1000) + 300, // Время истечения (через 5 минут)
				messages: [
					{
						address: receiver,
						amount: nanoAmount.toString(), // Сумма в нанотонах
					},
				],
			};

			// Отправка транзакции через TonKeeper
			await tonConnect?.sendTransaction(transaction);
			alert("Транзакция отправлена!");

		} catch (error) {
			console.error("Ошибка отправки транзакции:", error);
			alert("Не удалось отправить транзакцию");
		}
	};

	return (
		<html>
			<body>
				<div style={{ textAlign: 'center', marginTop: '50px' }}>
					<h1>Ton Connect + TonKeeper</h1>

					{wallet ? (
						<>
							<div>
								<p>Кошелек подключен: {wallet.account?.address}</p>
								<p>Баланс: {balance}</p>
								<button onClick={disconnectWallet}>Отключить кошелек</button>
							</div>

							<div>
								<input type="text" value={amount} onChange={handleAmountChange} />
								<input type="text" value={receiver} onChange={handleReceiverChange} />
								<button onClick={sendTransaction}>Send</button>
							</div>
						</>

					) : (
						<button onClick={connectWallet}>Подключить TonKeeper</button>
					)}
					{children}
				</div>
			</body>
		</html>
	);
}
