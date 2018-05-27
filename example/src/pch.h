#pragma once

#include <string>
#include <memory>
#include <vector>
#include <unordered_map>
#include <functional>

//duktape from https://github.com/svaarala/duktape 
#include "duktape.h"

typedef std::string String;

#define IDLAPI 

typedef void UserManager;
typedef UserManager* UserManagerPtr;

typedef FILE FileStream;
typedef FILE* FileStreamPtr;


typedef FILE TCPSocket;
typedef FILE* TCPSocketPtr;

/*
template <typename... ARGS>
using Callback = std::function<void(ARGS...)>;*/

typedef std::string Buffer;

static Buffer duktape_get_Buffer(duk_context* ctx, int index) {
	Buffer result;
	if (duk_is_string(ctx, index)) {
		const char* data = duk_get_string(ctx, index);
		result = data;
	}
	else {
		duk_size_t sz = 0;
		void* c = duk_get_buffer_data(ctx, index, &sz);
		if (c && sz) {
			result.assign((char*)c, sz);
		}
	}
	return result;
}

static void duktape_push_Buffer(duk_context* ctx, const Buffer& data) {
	void* ptr = duk_push_buffer(ctx, data.length(), 0);
	if (ptr) {
		memcpy(ptr, data.data(), data.length());
	}	
}

class  DukGlobalRef {
protected:
	duk_context* ctx_;

	void getUniqueKey(char* buf, int buflen) {
		snprintf(buf, buflen, "_cb_%p", this);
	}
public:
	DukGlobalRef(duk_context* ctx, int index) {
		//OutputDebugStringA("DuktapGlobalRef()\n");
		char key[64];
		getUniqueKey(key, 64);
		ctx_ = ctx;
		duk_push_global_object(ctx);
		duk_dup(ctx, index);
		duk_put_prop_string(ctx, -2, key);
		duk_pop(ctx);
	}
	~DukGlobalRef() {
		//OutputDebugStringA("~DuktapGlobalRef()\n");
		char key[64];
		getUniqueKey(key, 64);
		duk_push_global_object(ctx_);
		duk_del_prop_string(ctx_, -1, key);
		duk_pop(ctx_);
	}
	//-1 = object  -2 = global
	void push() {
		char key[64];
		getUniqueKey(key, 64);
		//duk_push_global_object(ctx_);		
		duk_get_global_string(ctx_, key);
	}

	void invoke(int argcount) {
		int ret = duk_pcall(ctx_, argcount);
		duk_pop(ctx_);
	}

	duk_context* ctx() { return ctx_; }
};


