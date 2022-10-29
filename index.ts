import { existsSync, openSync } from "fs"
import { exit } from "process"
import {
	listClassAccesors,
	listFieldAccessors,
	listMethodAccesors,
} from "./utils/Accessors"
import { readAttributeInfo } from "./utils/Attributes"
import BufferedReader from "./utils/BufferedReader"
import Class from "./utils/Class"
import {
	readClassInfo,
	readConstantPool,
	readNameIndex,
	readUtf8,
} from "./utils/ConstantPool"
import { betterDescriptor, betterMethodDescriptor } from "./utils/Descriptors"
import NotImplemented from "./utils/errors/NotImplemented"
import { stringify } from "./utils/Print"

const FILE_NAME = "Fibonnaci.class"

console.log("---------- LeTroll VM -------------")
console.log("By Fabcc [Fabien CAYRE]")

const exists = existsSync(FILE_NAME)
if (!exists) {
	console.log(`File '${FILE_NAME} 'doesn't exist`)
	exit(0)
}

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

const constantPool = readConstantPool(reader)

console.log(`${FILE_NAME} has a cst pool size of ${constantPool.size}`)

console.log("---------- LeTroll VM -------------")

// u2             access_flags;
const accessFlags = reader.readU2()
const accessorsFlag = listClassAccesors(accessFlags)

// u2             this_class;
const thisClass = reader.readU2()
const klass = new Class(
	readClassInfo(constantPool, thisClass - 1),
	minor,
	major,
	[],
	constantPool,
)
console.log(`Parsed ${klass.name}`)

// u2             super_class;
const thisSuperClass = reader.readU2()
console.log(`Super class : ${readClassInfo(constantPool, thisSuperClass - 1)}`)

// u2             interfaces_count;
const interfacesCount = reader.readU2()
console.log(`Interface count ${interfacesCount}`)
const interfaces = []
// u2             interfaces[interfaces_count];
for (let i = 0; i < interfacesCount; i++) {
	throw new NotImplemented("Interface not implemented yet")
}
// u2             fields_count;
const fieldsCount = reader.readU2()
console.log(`Fields count ${fieldsCount}`)
const fields = []
// field_info     fields[fields_count];
for (let i = 0; i < fieldsCount; i++) {
	// u2             access_flags;
	// u2             name_index;
	// u2             descriptor_index;
	// u2             attributes_count;
	// attribute_info attributes[attributes_count];
	const accessFlagsMask = reader.readU2()
	const fieldFlags = listFieldAccessors(accessFlagsMask)
	const nameIndex = reader.readU2()
	const fieldName = readNameIndex(constantPool, nameIndex - 1)
	const descriptorIndex = reader.readU2()
	const fieldDescriptor = readUtf8(constantPool, descriptorIndex - 1)
	const attributeCount = reader.readU2()
	const attributeInfo = readAttributeInfo(reader, attributeCount, constantPool)
	if(fieldFlags.includes("STATIC")){
		klass.fields.push({
			attributes: attributeInfo,
			descriptor: fieldDescriptor,
			flags: fieldFlags,
			name: fieldName,
			type: betterDescriptor(fieldDescriptor)
		})
		klass.staticFields[fieldName] = 0
	}else{
		throw new NotImplemented("Only static fields implemented yet")
	}
}
// u2             methods_count;
const methodsCount = reader.readU2()
console.log(`Methods count ${methodsCount}`)
const methods = []
// method_info    methods[methods_count];
for (let i = 0; i < methodsCount; i++) {
	// 	method_info {
	//     u2             access_flags;
	//     u2             name_index;
	//     u2             descriptor_index;
	//     u2             attributes_count;
	//     attribute_info attributes[attributes_count];
	// }
	const accessFlags = reader.readU2()
	const accessorsFlags = listMethodAccesors(accessFlags)
	const methodName = readNameIndex(constantPool, reader.readU2() - 1)
	const descriptors = readNameIndex(constantPool, reader.readU2() - 1)
	const methodSignature = betterMethodDescriptor(descriptors)
	const attributeCount = reader.readU2()
	const attributes = readAttributeInfo(reader, attributeCount, constantPool)
	methods.push({
		methodName,
		accessorsFlags,
		methodSignature,
		attributes,
	})
}
// u2             attributes_count;
const attributesCount = reader.readU2()
klass.attributes = readAttributeInfo(reader, attributesCount, constantPool)
klass.methods = methods

// console.log(JSON.stringify(methods, null, 1))
klass.resolve()
klass.executeMethod("main")
