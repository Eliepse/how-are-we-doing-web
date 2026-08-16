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
		this.rootDOM.querySelectorAll<HTMLElement>(`[data-slot] > *`).forEach((el) => el.remove());
	}

	getCellDOM(key: string): HTMLElement {
		const dom = this.rootDOM.querySelector<HTMLElement>(`[data-slot='${key}']`);

		if (!dom) {
			throw new Error(`Unable to find cell '${key}'`);
		}

		return dom;
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
}