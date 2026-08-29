export function queryHeaderElements(root = document) {
    return {
        siteHeader: root.querySelector("[data-site-header]"),
        navigationList: root.querySelector("[data-navigation-list]"),
        navigationCurtain: root.querySelector("[data-navigation-curtain]"),
        menuToggle: root.querySelector("[data-menu-toggle]"),
        submenuBack: root.querySelector("[data-submenu-back]"),
        submenuItems: Array.from(root.querySelectorAll("[data-submenu-item]")),
        plainNavigationItems: Array.from(
            root.querySelectorAll(".navigation-item:not([data-submenu-item])")
        ),
        mobileQuery: window.matchMedia("(max-width: 833px)"),
        reducedMotionQuery: window.matchMedia("(prefers-reduced-motion: reduce)")
    };
}

export function getTrigger(item) {
    return item?.querySelector("[data-submenu-trigger]");
}

export function getSubmenu(item) {
    return item?.querySelector("[data-submenu]");
}

export function getSubmenuContent(item) {
    return item?.querySelector(".submenu-content");
}

export function setExpanded(item, expanded) {
    getTrigger(item)?.setAttribute("aria-expanded", String(expanded));
}

export function clearDialogAttributes(submenu) {
    submenu?.removeAttribute("role");
    submenu?.removeAttribute("aria-modal");
    submenu?.removeAttribute("aria-label");
}
