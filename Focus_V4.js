/*
   This extension was made with TurboBuilder!
   https://turbobuilder-steel.vercel.app/
*/
(async function(Scratch) {
    const variables = {};
    const blocks = [];
    const menus = {};


    if (!Scratch.extensions.unsandboxed) {
        alert("This extension needs to be unsandboxed to run!")
        return
    }

    function doSound(ab, cd, runtime) {
        const audioEngine = runtime.audioEngine;

        const fetchAsArrayBufferWithTimeout = (url) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Timed out"));
                }, 5000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
                    }
                };
                xhr.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to request ${url}`));
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url);
                xhr.send();
            });

        const soundPlayerCache = new Map();

        const decodeSoundPlayer = async (url) => {
            const cached = soundPlayerCache.get(url);
            if (cached) {
                if (cached.sound) {
                    return cached.sound;
                }
                throw cached.error;
            }

            try {
                const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
                const soundPlayer = await audioEngine.decodeSoundPlayer({
                    data: {
                        buffer: arrayBuffer,
                    },
                });
                soundPlayerCache.set(url, {
                    sound: soundPlayer,
                    error: null,
                });
                return soundPlayer;
            } catch (e) {
                soundPlayerCache.set(url, {
                    sound: null,
                    error: e,
                });
                throw e;
            }
        };

        const playWithAudioEngine = async (url, target) => {
            const soundBank = target.sprite.soundBank;

            let soundPlayer;
            try {
                const originalSoundPlayer = await decodeSoundPlayer(url);
                soundPlayer = originalSoundPlayer.take();
            } catch (e) {
                console.warn(
                    "Could not fetch audio; falling back to primitive approach",
                    e
                );
                return false;
            }

            soundBank.addSoundPlayer(soundPlayer);
            await soundBank.playSound(target, soundPlayer.id);

            delete soundBank.soundPlayers[soundPlayer.id];
            soundBank.playerTargets.delete(soundPlayer.id);
            soundBank.soundEffects.delete(soundPlayer.id);

            return true;
        };

        const playWithAudioElement = (url, target) =>
            new Promise((resolve, reject) => {
                const mediaElement = new Audio(url);

                mediaElement.volume = target.volume / 100;

                mediaElement.onended = () => {
                    resolve();
                };
                mediaElement
                    .play()
                    .then(() => {
                        // Wait for onended
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });

        const playSound = async (url, target) => {
            try {
                if (!(await Scratch.canFetch(url))) {
                    throw new Error(`Permission to fetch ${url} denied`);
                }

                const success = await playWithAudioEngine(url, target);
                if (!success) {
                    return await playWithAudioElement(url, target);
                }
            } catch (e) {
                console.warn(`All attempts to play ${url} failed`, e);
            }
        };

        playSound(ab, cd)
    }
    class Extension {
        getInfo() {
            return {
                "blockIconURI": "data:image/png;base64,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",
                "id": "FocusV4",
                "name": "Focus V4",
                "color1": "#216b2c",
                "color2": "#000000",
                "tbShow": true,
                "blocks": blocks,
                "menus": menus
            }
        }
    }
    blocks.push({
        opcode: "FOCUSCREDITS",
        blockType: Scratch.BlockType.COMMAND,
        text: "Credits",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["FOCUSCREDITS"] = async (args, util) => {
        alert("Focus | By Gamer Mertcan");;
        window.open("https://youtube.com/@GamerMertcan", "_blank");;
    };

    blocks.push({
        opcode: "whenfocus",
        blockType: Scratch.BlockType.EVENT,
        text: "When Focused",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["whenfocus"] = async (args, util) => {};

    blocks.push({
        opcode: "afterfocus",
        blockType: Scratch.BlockType.EVENT,
        text: "After Focus",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["afterfocus"] = async (args, util) => {};

    blocks.push({
        opcode: "focusto",
        blockType: Scratch.BlockType.COMMAND,
        text: "Focus to [URL]",
        arguments: {
            "URL": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://example.com',
            },
        },
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["focusto"] = async (args, util) => {
        const existingIframe = document.querySelector('iframe.fullscreen-iframe');
        if (existingIframe) existingIframe.remove();
        const iframe = document.createElement('iframe');
        iframe.src = args.URL;
        iframe.className = "fullscreen-iframe";
        Object.assign(iframe.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            border: "none",
            zIndex: "9999"
        });
        document.body.appendChild(iframe);
        const fsMethod = iframe.requestFullscreen || iframe.mozRequestFullScreen || iframe.webkitRequestFullscreen || iframe.msRequestFullscreen;
        fsMethod?.call(iframe);
        const removeIframe = () => {
            if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
                iframe.remove();
                Scratch.vm.runtime.startHats(`${Extension.prototype.getInfo().id}_afterfocus`);
            }
        };
        document.onfullscreenchange = document.onwebkitfullscreenchange = document.onmozfullscreenchange = document.onmsfullscreenchange = removeIframe;;
        Scratch.vm.runtime.startHats(`${Extension.prototype.getInfo().id}_whenfocus`)
        variables['isfocused'] = true
        variables['focusedto'] = args["URL"]
    };

    blocks.push({
        opcode: "focusoff",
        blockType: Scratch.BlockType.COMMAND,
        text: "Focus off",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["focusoff"] = async (args, util) => {
        document.querySelector('iframe.fullscreen-iframe')?.remove();;
        Scratch.vm.runtime.startHats(`${Extension.prototype.getInfo().id}_afterfocus`)
        variables['isfocused'] = false
        variables['focusedto'] = null
    };

    blocks.push({
        opcode: "isfocused",
        blockType: Scratch.BlockType.BOOLEAN,
        text: "Is Focused?",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["isfocused"] = async (args, util) => {
        if (Boolean((variables['isfocused'] === undefined))) {
            return false

        } else {
            return variables['isfocused']

        };
    };

    blocks.push({
        opcode: "focusedto",
        blockType: Scratch.BlockType.REPORTER,
        text: "Focused To",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["focusedto"] = async (args, util) => {
        if (Boolean((variables['focusedto'] === undefined))) {
            return null

        } else {
            return variables['focusedto']

        };
    };

    Scratch.extensions.register(new Extension());
})(Scratch);