import {
    clearDialogAttributes,
    getSubmenu,
    getTrigger,
    setExpanded
} from "./dom.js";

export function createMobileNavigation({
    siteHeader,
    menuToggle,
    submenuItems,
    mobileQuery,
    reducedMotionQuery
}) {
    let currentItem = null;
    let focusTimer = 0;

    function setMenuOpen(open) {
        if (!mobileQuery.matches && open) {
            return;
        }

        siteHeader.classList.toggle("mobile-menu-open", open);
        document.body.classList.toggle("mobile-navigation-open", open);
        menuToggle?.setAttribute("aria-expanded", String(open));
        menuToggle?.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");

        if (!open) {
            closeSubmenu();
        }
    }

    function toggleMenu() {
        setMenuOpen(!siteHeader.classList.contains("mobile-menu-open"));
    }

    function openSubmenu(item) {
        if (!mobileQuery.matches || !item) {
            return;
        }

        window.clearTimeout(focusTimer);

        submenuItems.forEach((otherItem) => {
            const active = otherItem === item;
            const submenu = getSubmenu(otherItem);

            otherItem.classList.toggle("is-mobile-active", active);
            setExpanded(otherItem, active);

            if (active) {
                submenu?.setAttribute("role", "dialog");
                submenu?.setAttribute("aria-modal", "true");
                submenu?.setAttribute("aria-label", item.dataset.submenuLabel || "二级菜单");
            } else {
                clearDialogAttributes(submenu);
            }
        });

        currentItem = item;
        siteHeader.classList.add("mobile-submenu-open");
        focusTimer = window.setTimeout(() => {
            getSubmenu(item)?.querySelector("a")?.focus();
        }, reducedMotionQuery.matches ? 0 : 240);
    }

    function closeSubmenu({restoreFocus = false} = {}) {
        if (!currentItem && !siteHeader.classList.contains("mobile-submenu-open")) {
            return;
        }

        window.clearTimeout(focusTimer);

        const closingItem = currentItem;
        const closingTrigger = getTrigger(closingItem);

        submenuItems.forEach((item) => {
            item.classList.remove("is-mobile-active");
            setExpanded(item, false);
            clearDialogAttributes(getSubmenu(item));
        });

        currentItem = null;
        siteHeader.classList.remove("mobile-submenu-open");

        if (restoreFocus) {
            closingTrigger?.focus();
        }
    }

    function handleEscape() {
        if (siteHeader.classList.contains("mobile-submenu-open")) {
            closeSubmenu({restoreFocus: true});
            return;
        }

        setMenuOpen(false);
        menuToggle?.focus();
    }

    function reset() {
        window.clearTimeout(focusTimer);
        currentItem = null;

        submenuItems.forEach((item) => {
            item.classList.remove("is-mobile-active");
            setExpanded(item, false);
            clearDialogAttributes(getSubmenu(item));
        });

        siteHeader.classList.remove("mobile-menu-open", "mobile-submenu-open");
        document.body.classList.remove("mobile-navigation-open");
        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.setAttribute("aria-label", "打开导航菜单");
    }

    return {
        setMenuOpen,
        toggleMenu,
        openSubmenu,
        closeSubmenu,
        handleEscape,
        reset
    };
}
