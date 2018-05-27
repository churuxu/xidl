#include "pch.h"
#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <windows.h>

extern void BindAPI(duk_context* ctx);

char* load_file(const char* filename) {
	FILE* file = fopen(filename, "rb");
	long sz;
	char* result = NULL;
	if (file) {
		fseek(file, 0, SEEK_END);
		sz = ftell(file);
		fseek(file, 0, SEEK_SET);
		if (sz > 0) {
			result = (char*)malloc(sz + 1);
			if (result) {
				fread(result, 1, sz, file);
				*(result + sz) = 0;
			}
		}
		fclose(file);
	}
	return result;	
}

void on_error(duk_context *ctx, duk_errcode_t code, const char *msg) {
	printf("error:\n%s ",msg);
	
	getchar();
}


void handleError(duk_context * ctx_) {
	if (duk_is_error(ctx_, -1)) {
		duk_get_prop_string(ctx_, -1, "stack");
		const char* errmsg = duk_safe_to_string(ctx_, -1);
		//if (handler_) handler_(errmsg);
		printf("%s", errmsg);
		duk_pop(ctx_);
		duk_pop(ctx_);
	}
	else {
		const char* errmsg = duk_safe_to_string(ctx_, -1);
		//if (handler_) handler_(errmsg);
		printf("%s", errmsg);
		duk_pop(ctx_);
	}
}

int main(int argc, char* argv[]) {
	int ret = 0;
	const char* filename;
	const char* data;
	if (argc < 2)return 1;
	filename = argv[1];
	data = load_file(filename);
	if (!data) {
		printf("load file error:%s : %s", filename, strerror(errno));
		return 1;
	}
	duk_context* ctx = duk_create_heap(NULL,NULL,NULL,NULL, on_error);

	//InitconsoleAPI(ctx);
	//InitUserManagerAPI(ctx);
	
	BindAPI(ctx);

	duk_push_string(ctx, filename);
	duk_compile_string_filename(ctx, 0, data);
	//duk_call(ctx, 0);
	
	if (duk_pcall(ctx, 0) != 0) {		
		handleError(ctx);
		ret = 1;
	}
	duk_destroy_heap(ctx);	
	return ret;
}

