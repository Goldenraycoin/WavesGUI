(function () {
    'use strict';

    function AccountsController($scope, modes, events, passPhraseService, dialogService, cryptoService, loginContext) {
        var accounts = this;

        // by default start in list mode
        switchToMode(modes.LIST);

        $scope.$on(events.CHANGE_MODE, function (event, mode, param) {
            switchToMode(mode, param);
        });

        $scope.$on(events.GENERATE_SEED, function () {
            var seed = passPhraseService.generate();
            switchToMode(modes.REGISTER, seed);
            dialogService.openNonCloseable('#login-wPop-new');
        });

        function switchToMode(mode, param) {
            switch (mode) {
                case modes.REGISTER:
                    switchToRegisterMode(param);
                    break;

                case modes.CREATE_SEED:
                    switchToCreateSeedMode();
                    break;

                case modes.BACKUP_SEED:
                    switchToBackupSeed(param);
                    break;

                case modes.LIST:
                    switchToListMode();
                    break;

                case modes.LOGIN:
                    switchToLoginMode(param);
                    break;

                default:
                    throw new Error('Unsupported account operation: ' + mode);
            }

            accounts.mode = mode;
        }

        function switchToListMode() {
            accounts.caption = 'ACCOUNTS';
        }

        function switchToCreateSeedMode() {
            accounts.caption = 'SET UP YOUR SEED';
        }

        function switchToBackupSeed(appState) {
            accounts.visibleSeed = appState.seed;
            accounts.visibleAddress = appState.address;
            accounts.privateKey =  appState.keyPair.private;
            accounts.encodedSeed =  cryptoService.base58.encode(converters.stringToByteArray(appState.seed));

            function buildBackupClipboardText() {
                var text = 'Seed: ' + accounts.visibleSeed + '\n';
                text += 'Encoded seed: ' + accounts.encodedSeed + '\n';
                text += 'Private key: ' + accounts.privateKey + '\n';
                text += 'Public key: ' + appState.keyPair.public + '\n';
                text += 'Address: ' + accounts.visibleAddress;
                return text;
            }

            accounts.copyAllToClipboard = buildBackupClipboardText();

        }

        function switchToRegisterMode(seed) {
            accounts.caption = 'REGISTER ACCOUNT';
            accounts.displayAddress = cryptoService.buildRawAddressFromSeed(seed);
            // setting a seed to register a new account
            loginContext.seed = seed;
        }

        function switchToLoginMode(account) {
            accounts.caption = 'SIGN IN';
            accounts.displayAddress = account.address;
            // setting an account which we would like to sign in
            loginContext.currentAccount = account;
        }
    }

    AccountsController.$inject = [
        '$scope',
        'ui.login.modes',
        'ui.login.events',
        'passPhraseService',
        'dialogService',
        'cryptoService',
        'loginContext'
    ];

    angular
        .module('app.login')
        .controller('accountsController', AccountsController);
})();
