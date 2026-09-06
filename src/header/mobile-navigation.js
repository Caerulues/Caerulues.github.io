import {
    clearDialogAttributes,
    getSubmenu,
    getTrigger,
    setExpanded
} from "./dom.js";

const MENU_ITEM_REVEAL_START = 160;
const MENU_ITEM_REVEAL_STAGGER = 45;
const PRIMARY_EXIT_DURATION = 220;
const SUBMENU_TRANSITION_DURATION = 240;

export function createMobileNavigation({
    siteHeader,
    navigationList,
    menuToggle,
    submenuItems,
    mobileQuery,
    reducedMotionQuery
}) {
    let currentItem = null;
    let focusTimer = 0;
    let transitionTimer = 0;
    let animationFrame = 0;

    function clearTimers() {
        window.clearTimeout(focusTimer);
        window.clearTimeout(transitionTimer);
        window.cancelAnimationFrame(animationFrame);
    }

    function clearSubmenuState({restoreFocus = false} = {}) {
        const closingTrigger = getTrigger(currentItem);

        submenuItems.forEach((item) => {
            item.classList.remove("is-mobile-active");
            setExpanded(item, false);
            clearDialogAttributes(getSubmenu(item));
        });

        currentItem = null;
        siteHeader.classList.remove(
            "mobile-primary-leaving",
            "mobile-submenu-open",
            "mobile-submenu-visible"
        );

        if (restoreFocus) {
            closingTrigger?.focus();
        }
    }

    function prepare() {
        const primaryItems = Array.from(navigationList?.children ?? []).filter((item) => (
            item.classList.contains("navigation-item")
        ));

        primaryItems.forEach((item, index) => {
            const delay = MENU_ITEM_REVEAL_START + index * MENU_ITEM_REVEAL_STAGGER;
            item.style.setProperty("--mobile-item-delay", `${delay}ms`);
        });
    }

    function setMenuOpen(open) {
        if (!mobileQuery.matches && open) {
            return;
        }

        clearTimers();

        if (!open) {
            clearSubmenuState();
        }

        siteHeader.classList.toggle("mobile-menu-open", open);
        document.body.classList.toggle("mobile-navigation-open", open);
        menuToggle?.setAttribute("aria-expanded", String(open));
        menuToggle?.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
    }

    function toggleMenu() {
        setMenuOpen(!siteHeader.classList.contains("mobile-menu-open"));
    }

    function openSubmenu(item) {
        if (
            !mobileQuery.matches ||
            !item ||
            siteHeader.classList.contains("mobile-primary-leaving") ||
            siteHeader.classList.contains("mobile-submenu-open")
        ) {
            return;
        }

        clearTimers();
        currentItem = item;
        siteHeader.classList.add("mobile-primary-leaving");

        const primaryExitDelay = reducedMotionQuery.matches ? 0 : PRIMARY_EXIT_DURATION;

        transitionTimer = window.setTimeout(() => {
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

            siteHeader.classList.add("mobile-submenu-open");
            siteHeader.classList.remove("mobile-primary-leaving");

            animationFrame = window.requestAnimationFrame(() => {
                animationFrame = window.requestAnimationFrame(() => {
                    siteHeader.classList.add("mobile-submenu-visible");
                    focusTimer = window.setTimeout(() => {
                        getSubmenu(item)?.querySelector("a")?.focus();
                    }, reducedMotionQuery.matches ? 0 : SUBMENU_TRANSITION_DURATION);
                });
            });
        }, primaryExitDelay);
    }

    function closeSubmenu({restoreFocus = false, immediate = false} = {}) {
        const submenuTransitioning = siteHeader.classList.contains("mobile-primary-leaving");
        const submenuOpen = siteHeader.classList.contains("mobile-submenu-open");

        if (!currentItem && !submenuTransitioning && !submenuOpen) {
            return;
        }

        clearTimers();

        if (immediate || !submenuOpen) {
            clearSubmenuState({restoreFocus});
            return;
        }

        siteHeader.classList.remove("mobile-submenu-visible");

        const submenuExitDelay = reducedMotionQuery.matches
            ? 0
            : SUBMENU_TRANSITION_DURATION;

        transitionTimer = window.setTimeout(() => {
            clearSubmenuState({restoreFocus});
        }, submenuExitDelay);
    }

    function handleEscape() {
        if (
            siteHeader.classList.contains("mobile-primary-leaving") ||
            siteHeader.classList.contains("mobile-submenu-open")
        ) {
            closeSubmenu({restoreFocus: true});
            return;
        }

        setMenuOpen(false);
        menuToggle?.focus();
    }

    function reset() {
        clearTimers();
        clearSubmenuState();
        siteHeader.classList.remove("mobile-menu-open");
        document.body.classList.remove("mobile-navigation-open");
        menuToggle?.setAttribute("aria-expanded", "false");
        menuToggle?.setAttribute("aria-label", "打开导航菜单");
    }

    return {
        prepare,
        setMenuOpen,
        toggleMenu,
        openSubmenu,
        closeSubmenu,
        handleEscape,
        reset
    };
}
