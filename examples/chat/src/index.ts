import { DRPNode } from "@ts-drp/node";
import type { IDRPObject } from "@ts-drp/types";
import { DRP_DISCOVERY_TOPIC } from "@ts-drp/types";

import { Chat } from "./objects/chat";

class ChatStateManager {
	_node: DRPNode;
	_drpObject: IDRPObject<Chat> | undefined = undefined;

	constructor() {
		this._node = new DRPNode();
	}

	get chat(): Chat {
		if (!this.drp.drp) {
			throw new Error("Chat DRP not initialized");
		}
		return this.drp.drp;
	}

	get drp(): IDRPObject<Chat> {
		if (!this._drpObject) {
			throw new Error("DRP object not initialized");
		}
		return this._drpObject;
	}

	get node(): DRPNode {
		return this._node;
	}

	get peers(): string[] {
		return this._node.networkNode.getAllPeers();
	}

	get discoveryPeers(): string[] {
		return this._node.networkNode.getGroupPeers(DRP_DISCOVERY_TOPIC);
	}

	get objectPeers(): string[] {
		try {
			return this._node.networkNode.getGroupPeers(this.drp.id);
		} catch (e) {
			console.warn(e);
			return [];
		}
	}
}

const element_peers = <HTMLDivElement>document.getElementById("peers");
const element_discoveryPeers = <HTMLDivElement>document.getElementById("discoveryPeers");
const element_objectPeers = <HTMLDivElement>document.getElementById("objectPeers");
const element_peerId = <HTMLDivElement>document.getElementById("peerId");
const element_chatId = <HTMLDivElement>document.getElementById("chatId");
const element_chat = <HTMLDivElement>document.getElementById("chat");

const renderPeers = (chatState: ChatStateManager): void => {
	element_peers.innerHTML = `[${chatState.peers.join(", ")}]`;
};

const renderDiscoveryPeers = (chatState: ChatStateManager): void => {
	element_discoveryPeers.innerHTML = `[${chatState.discoveryPeers.join(", ")}]`;
};

const renderObjectPeers = (chatState: ChatStateManager): void => {
	element_objectPeers.innerHTML = `[${chatState.objectPeers.join(", ")}]`;
};

const renderPeerId = (chatState: ChatStateManager): void => {
	element_peerId.innerHTML = chatState.node.networkNode.peerId;
};

const renderChatId = (chatState: ChatStateManager): void => {
	if (!chatState.drp) return;

	element_chatId.innerHTML = chatState.drp.id;
};

const renderChat = (chatState: ChatStateManager): void => {
	const chat = chatState.chat.query_messages();
	element_chat.innerHTML = "";

	if (chat.size === 0) {
		const div = document.createElement("div");
		div.innerHTML = "No messages yet";
		div.style.padding = "10px";
		element_chat.appendChild(div);
		return;
	}

	for (const message of [...chat].sort()) {
		const div = document.createElement("div");
		div.innerHTML = message;
		div.style.padding = "10px";
		element_chat.appendChild(div);
	}
};

const render = (chatState: ChatStateManager): void => {
	renderChatId(chatState);
	renderPeerId(chatState);
	renderPeers(chatState);
	renderDiscoveryPeers(chatState);
	renderObjectPeers(chatState);
	renderChat(chatState);
};

function sendMessage(message: string, chatState: ChatStateManager): void {
	const timestamp: string = Date.now().toString();
	if (!chatState.drp.drp) {
		console.error("Chat DRP not initialized");
		alert("Please create or join a chat room first");
		return;
	}

	chatState.chat.addMessage(timestamp, message, chatState.node.networkNode.peerId);
	render(chatState);
}

function createConnectHandlers(chatState: ChatStateManager): void {
	const node = chatState.node;
	node.messageQueueManager.subscribe(chatState.drp.id, () => {
		// on create/connect
		renderChat(chatState);
	});

	node.objectStore.subscribe(chatState.drp.id, () => {
		renderChat(chatState);
	});
}

const button_create = <HTMLButtonElement>document.getElementById("createRoom");
const button_connect = <HTMLButtonElement>document.getElementById("joinRoom");
const button_send = <HTMLButtonElement>document.getElementById("sendMessage");
const room_input: HTMLInputElement = <HTMLInputElement>document.getElementById("roomInput");
const message_input: HTMLInputElement = <HTMLInputElement>document.getElementById("messageInput");

async function main(): Promise<void> {
	const chatState = new ChatStateManager();
	await chatState.node.start();
	// 1st render
	render(chatState);

	chatState.node.messageQueueManager.subscribe(DRP_DISCOVERY_TOPIC, () => {
		render(chatState);
	});

	const create = async (): Promise<void> => {
		chatState._drpObject = await chatState.node.createObject({ drp: new Chat() });
		createConnectHandlers(chatState);
		render(chatState);
	};

	const connect = async (): Promise<void> => {
		const objectId = room_input.value;
		if (!objectId) {
			alert("Please enter a room id");
			return;
		}

		chatState._drpObject = await chatState.node.connectObject({ id: objectId, drp: new Chat() });
		createConnectHandlers(chatState);
		render(chatState);
	};

	const sendMessageListener = (): void => {
		const message: string = message_input.value;
		message_input.value = "";
		if (!message) {
			console.error("Tried sending an empty message");
			alert("Please enter a message");
			return;
		}
		sendMessage(message, chatState);
		const element_chat = <HTMLDivElement>document.getElementById("chat");
		element_chat.scrollTop = element_chat.scrollHeight;
	};

	button_create.addEventListener("click", () => void create());
	button_connect.addEventListener("click", () => void connect());
	button_send.addEventListener("click", () => void sendMessageListener());

	// periodically render the peers
	setInterval(() => {
		renderChatId(chatState);
		renderPeers(chatState);
		renderDiscoveryPeers(chatState);
		renderObjectPeers(chatState);
	}, 1000);
}

void main();
