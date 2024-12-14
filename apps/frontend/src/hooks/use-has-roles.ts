import {symmetricDifference} from "rambda";
import {useAuth0} from "@auth0/auth0-react";

export function UseHasRoles(roles: string[]) {
	const {user} = useAuth0()
	if(!user) {
		return false;
	}
	const userRoles = 'https://storieslikegrapes.com' in user ? user['https://storieslikegrapes.com'].map((role: string) => role.toLowerCase()) : [];
	return symmetricDifference(userRoles, roles.map(role => role.toLowerCase())).length > 0;
}