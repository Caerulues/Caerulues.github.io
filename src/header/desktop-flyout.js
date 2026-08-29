import {getSubmenuContent, getTrigger, setExpanded} from "./dom.js";

const OPEN_DELAY = 120;
const CLOSE_DELAY = 120;

export function createDesktopFlyout({
    siteHeader,
    submenuItems,
    mobileQuery,
    reducedMotionQuery
}) {
    let currentItem = null;
    let openTimer = 0;
    let closeTimer = 0;
    let cleanupTimer = 0;

    function getAnimationRate(height) {
        if (reducedMotionQuery.matches) {
            return 1;
        }

        return Math.min(480, Math.max(240, Math.round(height / 2)));
    }

    function measureSubmenu(item) {
        const content = getSubmenuContent(item);
        return content ? Math.ceil(content.getBoundingClientRect().height) : 0;
    }

    function setHeaderHeight(height) {
        const rate = getAnimationRate(height);

        siteHeader.style.setProperty("--flyout-height", `${height}px`);
        siteHeader.style.setProperty("--flyout-rate", `${rate}ms`);

        return rate;
    }

    function clearTimers() {
        window.clearTimeout(openTimer);
        window.clearTimeout(closeTimer);
        window.clearTimeout(cleanupTimer);
    }

    function finishClosing(item) {
        item?.classList.remove("is-closing");
        siteHeader.classList.remove("flyout-closing");
        setHeaderHeight(0);
    }

    function close({restoreFocus = false} = {}) {
        if (!currentItem || mobileQuery.matches) {
            return;
        }

        clearTimers();

        const closingItem = currentItem;
        const closingTrigger = getTrigger(closingItem);
        const rate = setHeaderHeight(0);

        closingItem.classList.remove("is-open");
        closingItem.classList.add("is-closing");
        setExpanded(closingItem, false);
        siteHeader.classList.remove("flyout-open");
        siteHeader.classList.add("flyout-closing");
        document.body.classList.remove("navigation-open");
        currentItem = null;

        cleanupTimer = window.setTimeout(() => {
            finishClosing(closingItem);

            if (restoreFocus) {
                closingTrigger?.focus();
            }
        }, rate + CLOSE_DELAY);
    }

    function open(item) {
        if (!item || mobileQuery.matches || item === currentItem) {
            return;
        }

        clearTimers();

        const previousItem = currentItem;
        const previousHeight = previousItem
            ? parseFloat(getComputedStyle(siteHeader).getPropertyValue("--flyout-height")) || 0
            : 0;
        const nextHeight = measureSubmenu(item);

        submenuItems.forEach((otherItem) => {
            otherItem.classList.remove("is-open", "is-closing");
            setExpanded(otherItem, false);
        });

        currentItem = item;
        item.classList.add("is-open");
        setExpanded(item, true);
        siteHeader.classList.remove("flyout-closing");
        siteHeader.classList.add("flyout-open");
        document.body.classList.add("navigation-open");
        setHeaderHeight(previousItem ? previousHeight : 0);

        window.requestAnimationFrame(() => {
            setHeaderHeight(nextHeight);
        });
    }

    function scheduleOpen(item) {
        if (mobileQuery.matches || item === currentItem) {
            return;
        }

        window.clearTimeout(openTimer);
        window.clearTimeout(closeTimer);
        openTimer = window.setTimeout(() => open(item), OPEN_DELAY);
    }

    function scheduleClose() {
        if (mobileQuery.matches || !currentItem) {
            return;
        }

        window.clearTimeout(openTimer);
        window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(close, CLOSE_DELAY);
    }

    function cancelScheduledOpen() {
        window.clearTimeout(openTimer);
    }

    function cancelScheduledClose() {
        window.clearTimeout(closeTimer);
    }

    function prepare() {
        submenuItems.forEach((item) => {
            const groups = Array.from(item.querySelectorAll(".submenu-group"));
            const allFlyoutItems = Array.from(item.querySelectorAll(".flyout-item"));

            item.style.setProperty("--flyout-item-total", String(allFlyoutItems.length));

            groups.forEach((group, groupIndex) => {
                const flyoutItems = Array.from(group.querySelectorAll(".flyout-item"));

                flyoutItems.forEach((flyoutItem, itemIndex) => {
                    flyoutItem.style.setProperty("--group-index", String(groupIndex));
                    flyoutItem.style.setProperty("--item-index", String(itemIndex + 1));
                });
            });
        });

        setHeaderHeight(0);
    }

    function reset() {
        clearTimers();
        currentItem = null;

        submenuItems.forEach((item) => {
            item.classList.remove("is-open", "is-closing");
            setExpanded(item, false);
        });

        siteHeader.classList.remove("flyout-open", "flyout-closing");
        document.body.classList.remove("navigation-open");
        setHeaderHeight(0);
    }

    function resizeOpenSubmenu() {
        if (!mobileQuery.matches && currentItem) {
            setHeaderHeight(measureSubmenu(currentItem));
        }
    }

    return {
        prepare,
        open,
        close,
        scheduleOpen,
        scheduleClose,
        cancelScheduledOpen,
        cancelScheduledClose,
        reset,
        resizeOpenSubmenu,
        hasOpenItem: () => currentItem !== null
    };
}
