import dom from "../../utils/dom";

import "./langselector.scss";

/**
 * Lang selector
 * a menu for select prefered language
 */
class LangSelector {
  constructor() {
    this.setupTemplate();
    this.setChoices([
      { value: "en", label: "English" },
      { value: "fa", label: "فارسی" },
      { value: "zh", label: "简体中文" },
      { value: "fr", label: "Français" },
    ]);
  }

  /**
   * Build template of the controller
   * @return {DOMElement}
   */
  setupTemplate() {
    this.el = dom.create("div", "lang-selector disabled");
    this.el.onclick = () => this.el.classList.toggle("disabled");
    return this.el;
  }

  setChoices(choiceList) {
    let div = dom.create("div");
    choiceList.forEach((choice) => {
      let option = dom.create(
        "a",
        {
          href: window.location.href.replace(
            /dist(\/[a-z]{2})?(?=\/index\.html|$)/,
            `dist/${choice.value}`,
          ),
        },
        choice.label,
      );
      div.appendChild(option);
      div.appendChild(dom.create("br"));
    });
    this.el.appendChild(div);
  }
}

export default LangSelector;
