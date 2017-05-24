#include "pch.h"

//implement UserManager interface 

static std::vector<UserPtr> users_;
static std::vector<std::string> passwords_;
static std::unordered_map<std::string, int> loginnames_;

UserPtr UserManager::getUser(int id) {
	if (id > 0 && id <= (int)users_.size()) {
		return users_[id - 1];
	}
	return nullptr;
}

int UserManager::createUser(UserPtr u, const char* password) {
	if (!u) return 0;
	if (u->loginname.empty()) return 0;
	auto it = loginnames_.find(u->loginname);
	if (it != loginnames_.end()) return 0;

	int newid = users_.size() + 1;
	u->id = newid;
	users_.push_back(u);
	passwords_.push_back(password);
	loginnames_[u->loginname] = newid;
	return newid;
}

UserPtr UserManager::login(const char* loginname, const char* password) {
	auto it = loginnames_.find(loginname);
	if (it == loginnames_.end()) return nullptr;
	int id = it->second;
	if (passwords_[id - 1] != password) return nullptr;
	return getUser(id);
}

