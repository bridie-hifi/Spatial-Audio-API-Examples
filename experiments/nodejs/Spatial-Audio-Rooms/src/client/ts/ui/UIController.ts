import { connectionController, roomController, userDataController } from '..';
import '../../css/controls.scss';
import { AudionetInitResponse, ConnectionController } from '../connection/ConnectionController';
import { UserData } from '../userData/UserDataController';
import { CanvasRenderer } from './CanvasRenderer';

export class UIController {
    playOverlay: HTMLElement;
    canvasRenderer: CanvasRenderer;
    bottomControlsContainer: HTMLElement;
    toggleInputMuteButton: HTMLButtonElement;
    toggleOutputMuteButton: HTMLButtonElement;
    toggleVideoButton: HTMLButtonElement;
    modalBackground: HTMLDivElement;
    avatarContextMenu: HTMLDivElement;

    constructor() {
        this.initPlayOverlay();
        this.canvasRenderer = new CanvasRenderer();
        this.initMainUI();
        this.initContextMenu();
        this.removeLoadingOverlay();
    }

    initPlayOverlay() {
        this.playOverlay = document.createElement("div");
        this.playOverlay.classList.add("playOverlay");
        document.body.appendChild(this.playOverlay);

        let playContainer = document.createElement("div");
        playContainer.classList.add("playOverlay__container");
        this.playOverlay.appendChild(playContainer);

        let playHeader = document.createElement("h1");
        playHeader.classList.add("playOverlay__header");
        playContainer.appendChild(playHeader);

        let playText = document.createElement("h2");
        playText.classList.add("playOverlay__playText");
        playText.innerHTML = `Put on your <span class="playOverlay__headphones">headphones</span> <span class="playOverlay__thenPress">then press play:</span>`;
        playContainer.appendChild(playText);

        let playButton = document.createElement("button");
        playButton.setAttribute('aria-label', "Enter Spatial Audio Rooms Demo");
        playButton.classList.add("playOverlay__button");

        let playAnimation = document.createElement("div");
        playAnimation.classList.add("playOverlay__playAnimation");
        playButton.appendChild(playAnimation);
        playContainer.appendChild(playButton);

        playButton.addEventListener("click", (e) => { this.startConnectionProcess(); });
    }

    initMainUI() {
        this.bottomControlsContainer = document.createElement("div");
        this.bottomControlsContainer.classList.add("bottomControlsContainer");
        document.body.appendChild(this.bottomControlsContainer);

        this.toggleInputMuteButton = document.createElement("button");
        this.toggleInputMuteButton.classList.add("toggleInputMuteButton");
        this.bottomControlsContainer.appendChild(this.toggleInputMuteButton);

        this.toggleOutputMuteButton = document.createElement("button");
        this.toggleOutputMuteButton.classList.add("toggleOutputMuteButton");
        this.bottomControlsContainer.appendChild(this.toggleOutputMuteButton);

        this.toggleVideoButton = document.createElement("button");
        this.toggleVideoButton.classList.add("toggleVideoButton");
        this.bottomControlsContainer.appendChild(this.toggleVideoButton);

        this.modalBackground = document.createElement("div");
        this.modalBackground.classList.add("modalBackground", "displayNone");
        this.modalBackground.addEventListener("click", this.hideAvatarContextMenu.bind(this));
        document.body.appendChild(this.modalBackground);
    }

    initContextMenu() {
        this.avatarContextMenu = document.createElement("div");
        this.avatarContextMenu.classList.add("avatarContextMenu", "displayNone");
        this.avatarContextMenu.addEventListener("click", (e) => { e.stopPropagation(); });
        this.modalBackground.appendChild(this.avatarContextMenu);
    }

    removeLoadingOverlay() {
        document.querySelector('.loadingScreen').remove();
    }

    async startConnectionProcess() {
        this.playOverlay.classList.add("displayNone");

        let audionetInitResponse: AudionetInitResponse;
        try {
            audionetInitResponse = await connectionController.startConnectionProcess();
        } catch (e) {
            console.error(`Couldn't connect to High Fidelity! Error:\n${e}`);
            return;
        }
    }

    hideAvatarContextMenu() {
        this.modalBackground.classList.add("displayNone");
        this.avatarContextMenu.classList.add("displayNone");
    }

    showAvatarContextMenu(userData: UserData) {
        roomController.hideRoomList();

        this.avatarContextMenu.innerHTML = ``;

        let closeButton = document.createElement("button");
        closeButton.innerHTML = "X";
        closeButton.classList.add("avatarContextMenu__closeButton");
        closeButton.addEventListener("click", (e) => {
            this.hideAvatarContextMenu();
        });
        this.avatarContextMenu.appendChild(closeButton);

        let displayName;
        if (userData.visitIDHash === userDataController.myAvatar.myUserData.visitIDHash) {
            displayName = document.createElement("input");
            displayName.classList.add("avatarContextMenu__displayName--mine");
            displayName.type = "text";
            displayName.value = userData.displayName;

            displayName.addEventListener('input', (e) => {
                userDataController.myAvatar.onMyDisplayNameChanged((<HTMLInputElement>e.target).value);
            });
        } else {
            displayName = document.createElement("h1");
            displayName.innerText = userData.displayName;
        }
        displayName.classList.add("avatarContextMenu__displayName");
        this.avatarContextMenu.appendChild(displayName);

        this.modalBackground.classList.remove("displayNone");
        this.avatarContextMenu.classList.remove("displayNone");
    }
}
