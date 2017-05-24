#include "pch.h"
#include <stdio.h>
#include <errno.h>
#include <string.h>



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
	duk_context* ctx = duk_create_heap_default();

	InitconsoleAPI(ctx);
	InitUserManagerAPI(ctx);

	duk_push_string(ctx, filename);
	duk_compile_string_filename(ctx, 0, data);
	if (duk_pcall(ctx, 0) != 0) {		
		printf("%s\n", duk_safe_to_string(ctx, -1));
		ret = 1;
	}
	duk_destroy_heap(ctx);	
	return ret;
}

