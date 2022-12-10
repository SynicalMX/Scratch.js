import Account from "./Account";
import * as cld from "./Cloud";
var Scratch;
(function (Scratch) {
    function login(username, password) {
        return new Account(username, password);
    }
    function Cloud(account) {
        return new cld.default(account);
    }
})(Scratch || (Scratch = {}));
export default Scratch;
