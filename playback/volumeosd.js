﻿define(['events', 'playbackManager', 'dom', 'css!./volumeosd', 'material-icons'], function (events, playbackManager, dom) {
    'use strict';

    var currentPlayer;
    var osdElement;
    var iconElement;
    var progressElement;

    function getOsdElementHtml() {
        var html = '';

        html += '<i class="md-icon volumeOsdIcon">&#xE050;</i>';

        html += '<div class="volumeOsdProgressOuter"><div class="volumeOsdProgressInner"></div></div>';

        return html;
    }

    function ensureOsdElement() {

        var elem = osdElement;
        if (!elem) {
            elem = document.createElement('div');
            elem.classList.add('hide');
            elem.classList.add('volumeOsd');
            elem.classList.add('volumeOsd-hidden');
            elem.innerHTML = getOsdElementHtml();

            iconElement = elem.querySelector('i');
            progressElement = elem.querySelector('.volumeOsdProgressInner');

            document.body.appendChild(elem);
            osdElement = elem;
        }
    }

    function onHideComplete() {
        this.classList.add('hide');
    }

    var hideTimeout;
    function showOsd() {

        clearHideTimeout();

        var elem = osdElement;

        dom.removeEventListener(elem, dom.whichTransitionEvent(), onHideComplete, {
            once: true
        });

        elem.classList.remove('hide');

        // trigger reflow
        void elem.offsetWidth;

        requestAnimationFrame(function () {
            elem.classList.remove('volumeOsd-hidden');

            hideTimeout = setTimeout(hideOsd, 3000);
        });
    }

    function clearHideTimeout() {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    }

    function hideOsd() {

        clearHideTimeout();

        var elem = osdElement;
        if (elem) {

            // trigger reflow
            void elem.offsetWidth;

            requestAnimationFrame(function () {
                elem.classList.add('volumeOsd-hidden');

                dom.addEventListener(elem, dom.whichTransitionEvent(), onHideComplete, {
                    once: true
                });
            });
        }
    }

    function updatePlayerVolumeState(isMuted, volume) {

        if (iconElement) {
            iconElement.innerHTML = isMuted ? '&#xE04F;' : '&#xE050;';
        }
        if (progressElement) {
            progressElement.style.width = (volume || 0) + '%';
        }
    }

    function releaseCurrentPlayer() {

        var player = currentPlayer;

        if (player) {
            events.off(player, 'volumechange', onVolumeChanged);
            events.off(player, 'playbackstop', hideOsd);
            currentPlayer = null;
        }
    }

    function onVolumeChanged(e) {

        var player = this;

        ensureOsdElement();

        updatePlayerVolumeState(player.isMuted(), player.getVolume());

        showOsd();
    }

    function bindToPlayer(player) {

        if (player === currentPlayer) {
            return;
        }

        releaseCurrentPlayer();

        currentPlayer = player;

        if (!player) {
            return;
        }

        hideOsd();
        events.on(player, 'volumechange', onVolumeChanged);
        events.on(player, 'playbackstop', hideOsd);
    }

    events.on(playbackManager, 'playerchange', function () {
        bindToPlayer(playbackManager.getCurrentPlayer());
    });

    bindToPlayer(playbackManager.getCurrentPlayer());

});