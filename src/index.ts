import Account from "./Account";
import * as cld from "./Cloud";

namespace Scratch {
	export function login(username: string, password: string) {
		return new Account(username, password)
	}

	export function Cloud(account: Account) {
		return new cld.default(account)
	}
}

export default Scratch