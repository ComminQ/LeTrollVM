import { existsSync, openSync } from "fs"
import { exit } from "process"
import { listClassAccesors } from "./utils/Accessors"
import BufferedReader from "./utils/BufferedReader"
import {
	CONSTANTS_POOL,
	printClassInfo,
	readClassInfo,
} from "./utils/ConstantPool"
import NotImplemented from "./utils/errors/NotImplemented"

const FILE_NAME = "Main.class"

console.log("---------- LeTroll VM -------------")
console.log("By Fabcc [Fabien CAYRE]")

const exists = existsSync(FILE_NAME)
if (!exists) {
	console.log(`File '${FILE_NAME} 'doesn't exist`)
	exit(0)
}

/*ClassFile {
    u4             magic;
    u2             minor_version;
    u2             major_version;
    u2             constant_pool_count;
    cp_info        constant_pool[constant_pool_count-1];
    u2             access_flags;
    u2             this_class;
    u2             super_class;
    u2             interfaces_count;
    u2             interfaces[interfaces_count];
    u2             fields_count;
    field_info     fields[fields_count];
    u2             methods_count;
    method_info    methods[methods_count];
    u2             attributes_count;
    attribute_info attributes[attributes_count];
}*/

const file = openSync(FILE_NAME, "r")
const reader: BufferedReader = new BufferedReader(file)

// u4             magic;
const magik = reader.readU4()
if (magik != 0xcafebabe) {
	console.log("Cafe babe not found, not a correct file :LeTroll:")
	exit(1)
}
console.log("CAFEBABE found ! Now ... this is epic")
// u2             minor_version;
// u2             major_version;
const minor = reader.readU2()
const major = reader.readU2()
console.log(`${FILE_NAME} version ${major}:${minor}`)

// u2             constant_pool_count;
const constantPool = []
const constantPoolSize = reader.readU2()

console.log(`${FILE_NAME} has a cst pool size of ${constantPoolSize}`)

// cp_info        constant_pool[constant_pool_count-1];
for (let i = 0; i < constantPoolSize - 1; i++) {
	// ctx pool init
	const tag = reader.readU1()
	const name = CONSTANTS_POOL[tag]
	if (name == "Methodref") {
		const classIndex = reader.readU2()
		const nameAndTypeIndex = reader.readU2()
		constantPool.push({ name, classIndex, nameAndTypeIndex })
	} else if (name == "Fieldref") {
		const classIndex = reader.readU2()
		const nameAndTypeIndex = reader.readU2()
		constantPool.push({ name, classIndex, nameAndTypeIndex })
	} else if (name == "InterfaceMethodref") {
		const classIndex = reader.readU2()
		const nameAndTypeIndex = reader.readU2()
		constantPool.push({ name, classIndex, nameAndTypeIndex })
	} else if (name == "String") {
		const stringIndex = reader.readU2()
		constantPool.push({ name, stringIndex })
	} else if (name == "Class") {
		const nameIndex = reader.readU2()
		constantPool.push({ name, nameIndex })
	} else if (name == "Utf8") {
		const strLength = reader.readU2()
		const value = reader.readUTF(strLength)
		constantPool.push({ name, strLength, value })
	} else if (name == "NameAndType") {
		const nameIndex = reader.readU2()
		const descriptorIndex = reader.readU2()
		constantPool.push({ name, nameIndex, descriptorIndex })
	} else {
		throw new NotImplemented(`${name} [${tag}] read is not implemetend yet`)
	}
}
// printClassInfo(constantPool)
console.log("---------- LeTroll VM -------------")

// u2             access_flags;
const accessFlags = reader.readU2()
const accessorsFlag = listClassAccesors(accessFlags)

// u2             this_class;
const thisClass = reader.readU2()
console.log(`Parsed ${readClassInfo(constantPool, thisClass-1)}`)

// u2             super_class;
const thisSuperClass = reader.readU2()
console.log(`Super class : ${readClassInfo(constantPool, thisSuperClass-1)}`)
