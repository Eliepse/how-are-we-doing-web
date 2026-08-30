class DOMPresenter {
	constructor(private rootDOM: HTMLElement) {
		this.hide();
	}

	show() {
		this.rootDOM.style.display = "";
	}

	hide() {
		this.rootDOM.style.display = "none";
	}

	clear() {
		document.querySelectorAll<HTMLElement>(".presentor-item").forEach((el) => el.style.opacity = "0");
	}
}

export class Presenter {
	private static _instance: DOMPresenter | undefined = undefined;

	static get presenter(): DOMPresenter {
		const dom = document.querySelector<HTMLElement>("#presenter");

		if (!dom) {
			throw new Error("Presenter node not found");
		}

		return Presenter._instance ??= new DOMPresenter(dom);
	}

	static show() {
		Presenter.presenter.show();
	}

	static hide() {
		Presenter.presenter.hide();
	}

	static clear() {
		Presenter.presenter.clear();
	}
}