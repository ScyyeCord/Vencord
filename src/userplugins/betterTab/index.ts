/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";

export default definePlugin({
    name: "Better Tab",
    description: "Makes tab an actually useful keybind",
    authors: [{ id: 553652308295155723n, name: "Scyye" }],
    patches:
        [
            /*
            {
                find: "onkeydown",
                replacement: {
                    replace: "keyFilter(event,this);",
                    match: /(\w+)\.onkeydown=function\(\){return\s*!1};/
                }
            }
            */
        ],
    start() {
        // Add event listener to intercept Tab key presses
        document.addEventListener("keydown", function (event) {
            // Check if the Tab key is pressed
            if (event.key === "Tab") {
                // Prevent the default Tab key behavior
                event.preventDefault();

                emulateCtrlK(document.body);
                event.stopImmediatePropagation();
            }
        });
    },
    stop() {
        // Clean up when the plugin is unloaded (optional)
        document.removeEventListener("keydown", function (event) {
            if (document.activeElement == null)
                return;
            if (event.key === "Tab" && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
                event.stopImmediatePropagation();
            }
        });
    },
});

function emulateCtrlK(targetElement: Element = document.body): void {
    // Check if the element is valid before dispatching events
    if (!targetElement) {
        console.error("The specified target element is invalid.");
        return;
    }

    // Define the common properties for the keyboard events.
    const eventOptions: KeyboardEventInit = {
        key: "k",
        code: "KeyK",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
    };

    // Step 1: Dispatch the keydown event for the 'k' key with Ctrl held down.
    // This simulates the actual key being pressed while Ctrl is active.
    const keydownEvent = new KeyboardEvent("keydown", eventOptions);
    targetElement.dispatchEvent(keydownEvent);

    // Step 2: Dispatch the keyup event for the 'k' key.
    // This signifies the release of the 'k' key.
    const keyupEvent = new KeyboardEvent("keyup", eventOptions);
    targetElement.dispatchEvent(keyupEvent);
}
