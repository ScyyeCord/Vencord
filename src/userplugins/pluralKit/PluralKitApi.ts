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

export type System = {
    id: string;
    uuid: string;
    name: string;
    description: string;
    tag: string;
    pronouns: string;
    avatar_url: string;
    banner: string;
    color: string;
    created: string;
    privacy: SystemPrivacy;
};

export type SystemPrivacy = {
    description_privacy: "public"|"private";
    pronoun_privacy: "public"|"private";
    member_list_privacy: "public"|"private";
    group_list_privacy: "public"|"private";
    front_privacy: "public"|"private";
    front_history_privacy: "public"|"private";
};

export type Member = {
    id: string;
    uuid: string;
    system: string;
    name: string;
    display_name: string;
    color: string;
    birthday: string;
    pronouns: string;
    avatar_url: string;
    webhook_avatar_url: string;
    banner: string;
    description: string;
    created: string;
    proxy_tags: { prefix:string; suffix:string }[];
    keep_proxy: boolean;
    tts: boolean;
    autoproxy_enabled: boolean;
    message_count: number;
    last_message_timestamp: string;
    privacy: MemberPrivacy;
};

export type MemberPrivacy = {
    visibility: "public"|"private";
    name_privacy: "public"|"private";
    description_privacy: "public"|"private";
    birthday_privacy: "public"|"private";
    pronoun_privacy: "public"|"private";
    avatar_privacy: "public"|"private";
    metadata_privacy: "public"|"private";
    proxy_privacy: "public"|"private";
};

export type PKMessage = {
    timestamp: string;
    id: string;
    original: string;
    sender: string;
    channel: string;
    guild: string;
    system?: System;
    member?: Member;
};

export type SystemGuildSettings = {
    guild_id?: string;
    proxying_enabled: boolean;
    tag: string;
    tag_enabled: boolean;
};

export type MemberGuildSettings = {
    guild_id: string;
    display_name: string;
    avatar_url?: string;
    keep_proxy?: boolean;
};

