import {queryHeaderElements, getTrigger} from "./header/dom.js";
import {createDesktopFlyout} from "./header/desktop-flyout.js";
import {createMobileNavigation} from "./header/mobile-navigation.js";

const elements = queryHeaderElements();

if (elements.siteHeader && elements.navigationList) {
    initializeHeader(elements);
}

function initializeHeader({
    siteHeader,
    navigationList,
    navigationCurtain,
    menuToggle,
    submenuBack,
    submenuItems,
    plainNavigationItems,
    mobileQuery,
    reducedMotionQuery
}) {
    const desktopFlyout = createDesktopFlyout({
        siteHeader,
        submenuItems,
        mobileQuery,
        reducedMotionQuery
    });
    const mobileNavigation = createMobileNavigation({
        siteHeader,
        navigationList,
        menuToggle,
        submenuItems,
        mobileQuery,
        reducedMotionQuery
    });

    submenuItems.forEach((item) => {
        const trigger = getTrigger(item);

        item.addEventListener("pointerenter", () => {
            desktopFlyout.scheduleOpen(item);
        });

        item.addEventListener("pointerleave", () => {
            desktopFlyout.cancelScheduledOpen();
        });

        item.addEventListener("focusin", () => {
            desktopFlyout.open(item);
        });

        trigger?.addEventListener("click", () => {
            if (mobileQuery.matches) {
                mobileNavigation.openSubmenu(item);
            } else {
                desktopFlyout.open(item);
            }
        });
    });

    plainNavigationItems.forEach((item) => {
        item.addEventListener("pointerenter", desktopFlyout.scheduleClose);
        item.addEventListener("focusin", desktopFlyout.close);
    });

    siteHeader.addEventListener("pointerenter", desktopFlyout.cancelScheduledClose);
    siteHeader.addEventListener("pointerleave", desktopFlyout.scheduleClose);
    siteHeader.addEventListener("focusout", (event) => {
        const nextTarget = event.relatedTarget;

        if (!mobileQuery.matches && nextTarget && !siteHeader.contains(nextTarget)) {
            desktopFlyout.close();
        }
    });

    menuToggle?.addEventListener("click", () => {
        mobileNavigation.toggleMenu();
    });

    submenuBack?.addEventListener("click", () => {
        mobileNavigation.closeSubmenu({restoreFocus: true});
    });

    navigationCurtain?.addEventListener("click", desktopFlyout.close);

    navigationList.addEventListener("click", (event) => {
        const target = event.target;
        const link = target instanceof Element ? target.closest("a") : null;

        if (link && mobileQuery.matches) {
            mobileNavigation.setMenuOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        if (mobileQuery.matches) {
            mobileNavigation.handleEscape();
        } else {
            desktopFlyout.close({restoreFocus: true});
        }
    });

    window.addEventListener("scroll", () => {
        if (!mobileQuery.matches && desktopFlyout.hasOpenItem()) {
            desktopFlyout.close();
        }
    }, {passive: true});

    window.addEventListener("resize", desktopFlyout.resizeOpenSubmenu);

    mobileQuery.addEventListener("change", () => {
        desktopFlyout.reset();
        mobileNavigation.reset();
    });

    mobileNavigation.prepare();
    desktopFlyout.prepare();
}
