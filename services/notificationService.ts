import { notifications } from './firebase';

export const notificationService = {
    sendConnectionRequest: async (receiverId: string, senderName: string) => {
        await notifications.send(
            receiverId,
            senderName,
            `sent you a connection request.`,
            '',
            'connection'
        );
    },

    sendConnectionAccepted: async (receiverId: string, senderName: string) => {
        await notifications.send(
            receiverId,
            senderName,
            `accepted your connection request.`,
            '',
            'connection'
        );
    },

    sendChatMessage: async (receiverId: string, senderName: string, content: string, chatId: string) => {
        await notifications.send(
            receiverId,
            senderName,
            content,
            chatId,
            'chat'
        );
    },

    sendWelcome: async (receiverId: string, userName: string) => {
        await notifications.send(
            receiverId,
            'AssignMate Team',
            `Welcome to AssignMate, ${userName}! Complete your profile to get started.`,
            '',
            'system'
        );
    }
};
