import pgStructure, {
  Column,
  M2MRelation,
  M2ORelation,
  O2MRelation,
  Relation,
  RelationType,
  Schema,
  Table,
} from "pg-structure";

import { writeFile } from "fs/promises";

import yargs from "yargs";

import { hideBin } from "yargs/helpers";

const options = yargs(hideBin(process.argv))
  .option("schema", {
    type: "string",
    array: true,
    default: ["public"],
  })
  .option("host", {
    type: "string",
    default: "localhost",
  })
  .option("database", {
    type: "string",
    demandOption: true,
  })
  .option("user", {
    type: "string",
    demandOption: true,
  })
  .option("password", {
    type: "string",
    demandOption: true,
  })
  .option("filename", {
    type: "string",
    default: "output.txt",
  }).argv;

async function main() {
  const args = await options;

  const db = await pgStructure(
    { database: args.database, user: args.user, password: args.password },
    { includeSchemas: args.schema }
  );

  const root = db.schemas.get("public");

  await writeFile(`${__dirname}/${args.filename}`, outputSchema(root), "utf8");
}

const outputSchema = (schema: Schema) => {
  const tables = schema.tables.map(formatTable);

  const allDefinitions = tables.map((t) => t.definition).join("\n\n");
  const allRelations = tables.map((t) => t.relations).join("\n");

  return `${allDefinitions}\n\n${allRelations}`;
};

const formatTable = (table: Table) => {
  const body = table.columns.map((c: any) => {
    return `    ${c.name}: ${formatType(c)} `;
  });

  const definition = `${table.name} [] { 
${body.join("\n")}
}`;

  const relations = table.m2oRelations.flatMap(formatRelations).join("\n");

  return {
    definition,
    relations,
  };
};

const formatType = (column: Column) => {
  const type = column.type;

  const name = (type.internalName || type.name).toUpperCase();

  let output = name;

  if (column.isPrimaryKey) {
    output += " pk";
  }

  if (type.hasPrecision) {
    output += `(${column.precision})`;
  }

  if (column.notNull) {
    output += " NOT NULL";
  }

  return output;
};

type AnyRelation = O2MRelation | M2MRelation | M2ORelation;

const registeredRelations = new Set();

const formatRelations = (relation: AnyRelation) => {
  const seperator = relations[relation.type];

  if (!seperator) {
    throw new Error(`Unknown relation type: ${relation.type}`);
  }

  const fk = relation.foreignKey;

  const column = fk.index.columnsAndExpressions.find(
    (c) => c instanceof Column
  ) as Column;

  registeredRelations.add(fk.name);

  return fk.columns.map((c) => {
    const left = `${relation.sourceTable.name}.${c.name}`;
    const right = `${relation.targetTable.name}.${column.name}`;

    return `${left} ${seperator} ${right}`;
  });
};

const relations = {
  // table.columns
  [RelationType.M2O]: ">",
  [RelationType.O2M]: "<",
  [RelationType.M2M]: "<>",
};

main();
