/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { DataStore } from "@api/index";
import { addButton, removeButton } from "@api/MessagePopover";
import { definePluginSettings } from "@api/Settings";
import { insertTextIntoChatInputBox } from "@utils/discord";
import definePlugin, { OptionType, StartAt } from "@utils/types";
import { ChannelStore, FluxDispatcher } from "@webpack/common";
import { Message } from "discord-types/general";
import { Member, PKAPI, System } from "pkapi.js";

const api = new PKAPI({
});

function isPk(msg: Message) {
    // If the message is null, early return
    return (msg && msg.applicationId === "466378653216014359");
}

const EditIcon = () => {
    return <svg role={"img"} width={"16"} height={"16"} fill={"none"} viewBox={"0 0 24 24"}>
        <path fill={"currentColor"} d={"m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0 0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0 1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1 1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5 1.5 0 0 1-1.73-1.73Z"}></path>
    </svg>;
};

const settings = definePluginSettings({
    colorNames: {
        type: OptionType.BOOLEAN,
        description: "Display member colors in their names in chat",
        default: false
    },
    displayMemberId: {
        type: OptionType.BOOLEAN,
        description: "Display member IDs in chat",
        default: false
    }
});

// I dont fully understand how to use datastores, if i used anything incorrectly please let me know
const DATASTORE_KEY = "pk";

let authors: Record<string, { messageIds: string[]; member: Member|string|undefined; system: System; }> = {};
(async () => {
    authors = await DataStore.get<Record<string, { name: string; messageIds: string[]; member: Member|string|undefined; system: System; }>>(DATASTORE_KEY) || {};
})();


export default definePlugin({
    name: "Plural Kit",
    description: "Pluralkit integration for Vencord",
    authors: [{
        name: "Scyye",
        id: 553652308295155723n
    }],
    startAt: StartAt.WebpackReady,
    settings,
    patches: [
        {
            find: ".useCanSeeRemixBadge)",
            replacement: {
                match: /(?<=onContextMenu:\i,children:).*?\)}/,
                replace: "$self.renderUsername(arguments[0])}"
            }
        },
    ],

    renderUsername: ({ author, message, isRepliedMessage, withMentionPrefix }) => {
        const prefix = isRepliedMessage && withMentionPrefix ? "@" : "";
        try {
            const discordUsername = author.nick??author.displayName??author.username;
            if (!isPk(message))
                return <>{prefix}{discordUsername}</>;

            const authorOfMessage = getAuthorOfMessage(message);
            let color: string = "ffffff";

            if (authorOfMessage?.member instanceof Member && settings.store.colorNames) {
                color = authorOfMessage.member.color??color;
            }
            const member: Member = authorOfMessage?.member as Member;
            return <span style={{
                color: `#${color}`,
            }}>{prefix}{member.display_name??member.name}{authorOfMessage.system?.tag??""}{settings.store.displayMemberId?` (${member.id})`:""}</span>;
        } catch {
            return <>{prefix}{author?.nick}</>;
        }
    },

    async start() {
        DataStore.createStore(DATASTORE_KEY, DATASTORE_KEY);

        addButton("pk-edit", msg => {
            if (!msg) return null;
            console.log(msg);
            if (!isPk(msg)) return null;
            console.log(msg);

            const handleClick = () => {
                replyToMessage(msg, false, true, "pk;edit " + msg.content);
            };

            return {
                label: "Edit",
                icon: () => {
                    return <EditIcon/>;
                },
                message: msg,
                channel: ChannelStore.getChannel(msg.channel_id),
                onClick: handleClick,
                onContextMenu: _ => {}
            };
        });
    },
    stop() {
        removeButton("pk-edit");
    },
});

function replyToMessage(msg: Message, mention: boolean, hideMention: boolean, content?: string | undefined) {
    FluxDispatcher.dispatch({
        type: "CREATE_PENDING_REPLY",
        channel: ChannelStore.getChannel(msg.channel_id),
        message: msg,
        shouldMention: mention,
        showMentionToggle: !hideMention,
    });
    if (content) {
        insertTextIntoChatInputBox(content);
    }
}

function getAuthorOfMessage(message: Message) {
    if (authors[message.author.username]) {
        authors[message.author.username].messageIds.push(message.id);
        return authors[message.author.username];
    }

    api.getMessage({ message: message.id }).then(msg => {
        authors[message.author.username] = ({ messageIds: [msg.id], member: msg.member, system: msg.system as System });
    });

    DataStore.set(DATASTORE_KEY, authors);
    return authors[message.author.username];
}