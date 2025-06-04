/**
 * Example demonstrating semantic operations with format-neutral processing
 */

import {
  PipeFitter,
  FNode,
  FNodeType,
  createMessageFromFNode,
  createContext,
  LoggerFactory,
  ConfigurationManager,
  ResourceManager,
  TransformationEngine,
  FormatAwareOperations,
  FormatType,
  JSON_SEMANTICS,
  CSV_SEMANTICS,
  XML_SEMANTICS
} from '../src/index.js';

// Example: Create sample data in different formats

function createJsonUserData(): FNode {
  return createFNode(FNodeType.COLLECTION, 'users', undefined, {
    children: [
      createFNode(FNodeType.RECORD, 'user', undefined, {
        children: [
          createFNode(FNodeType.FIELD, 'id', 1),
          createFNode(FNodeType.FIELD, 'name', 'John Doe'),
          createFNode(FNodeType.FIELD, 'email', 'john@example.com'),
          createFNode(FNodeType.FIELD, 'active', true),
          createFNode(FNodeType.FIELD, 'department', 'Engineering')
        ]
      }),
      createFNode(FNodeType.RECORD, 'user', undefined, {
        children: [
          createFNode(FNodeType.FIELD, 'id', 2),
          createFNode(FNodeType.FIELD, 'name', 'Jane Smith'),
          createFNode(FNodeType.FIELD, 'email', 'jane@example.com'),
          createFNode(FNodeType.FIELD, 'active', false),
          createFNode(FNodeType.FIELD, 'department', 'Marketing')
        ]
      }),
      createFNode(FNodeType.RECORD, 'user', undefined, {
        children: [
          createFNode(FNodeType.FIELD, 'id', 3),
          createFNode(FNodeType.FIELD, 'name', 'Bob Wilson'),
          createFNode(FNodeType.FIELD, 'email', 'bob@example.com'),
          createFNode(FNodeType.FIELD, 'active', true),
          createFNode(FNodeType.FIELD, 'department', 'Engineering')
        ]
      })
    ]
  });
}

function createCsvUserData(): FNode {
  return createFNode(FNodeType.COLLECTION, 'dataset', undefined, {
    children: [
      createFNode(FNodeType.RECORD, 'row', undefined, {
        children: [
          createFNode(FNodeType.FIELD, 'id', 1),
          createFNode(FNodeType.FIELD, 'name', 'John Doe'),
          createFNode(FNodeType.FIELD, 'email', 'john@example.com'),
          createFNode(FNodeType.FIELD, 'active', true),
          createFNode(FNodeType.FIELD, 'department', 'Engineering')
        ]
      }),
      createFNode(FNodeType.RECORD, 'row', undefined, {
        children: [
          createFNode(FNodeType.FIELD, 'id', 2),
          createFNode(FNodeType.FIELD, 'name', 'Jane Smith'),
          createFNode(FNodeType.FIELD, 'email', 'jane@example.com'),
          createFNode(FNodeType.FIELD, 'active', false),
          createFNode(FNodeType.FIELD, 'department', 'Marketing')
        ]
      }),
      createFNode(FNodeType.RECORD, 'row', undefined, {
        children: [
          createFNode(FNodeType.FIELD, 'id', 3),
          createFNode(FNodeType.FIELD, 'name', 'Bob Wilson'),
          createFNode(FNodeType.FIELD, 'email', 'bob@example.com'),
          createFNode(FNodeType.FIELD, 'active', true),
          createFNode(FNodeType.FIELD, 'department', 'Engineering')
        ]
      })
    ]
  });
}

// Helper function to extend createFNode with optional properties
function createFNode(
  type: FNodeType,
  name: string,
  value?: any,
  options?: { children?: FNode[]; attributes?: FNode[]; id?: string }
): FNode {
  return {
    type,
    name,
    value,
    ...options
  };
}

async function demonstrateSemanticOperations() {
  console.log('=== PipeFitter Semantic Operations Demo ===\n');

  // Setup
  const config = ConfigurationManager.create();
  const logger = LoggerFactory.create('demo');
  const resources = new ResourceManager();
  const context = createContext(logger, config, resources);

  // Initialize transformation engine
  const engine = new TransformationEngine();
  engine.register(JSON_SEMANTICS);
  engine.register(CSV_SEMANTICS);
  engine.register(XML_SEMANTICS);

  const operations = new FormatAwareOperations(engine);

  // Create test data
  const jsonData = createJsonUserData();
  const csvData = createCsvUserData();

  console.log('1. Format-Aware Operations on JSON Data');
  console.log('=====================================');
  
  const jsonMessage = createMessageFromFNode(jsonData, context);
  
  // Find active users
  const activeUsers = operations.find(
    jsonMessage,
    (user) => operations.extractValue(user, 'active', FormatType.JSON) === true,
    FormatType.JSON
  );
  console.log(`Found ${activeUsers.length} active users in JSON format`);

  // Filter engineering department
  const engineeringUsers = operations.filter(
    jsonMessage,
    (user) => operations.extractValue(user, 'department', FormatType.JSON) === 'Engineering',
    FormatType.JSON
  );
  console.log(`Filtered to ${operations.count(engineeringUsers, FormatType.JSON)} engineering users`);

  // Group by department
  const groupedUsers = operations.groupBy(
    jsonMessage,
    (user) => operations.extractValue(user, 'department', FormatType.JSON) || 'Unknown',
    FormatType.JSON
  );
  console.log('Users grouped by department:');
  for (const [dept, users] of groupedUsers) {
    console.log(`  ${dept}: ${users.length} users`);
  }

  console.log('\n2. Same Operations on CSV Data');
  console.log('==============================');
  
  const csvMessage = createMessageFromFNode(csvData, context);
  
  // Same operations, different format
  const activeUsersCSV = operations.find(
    csvMessage,
    (user) => operations.extractValue(user, 'active', FormatType.CSV) === true,
    FormatType.CSV
  );
  console.log(`Found ${activeUsersCSV.length} active users in CSV format`);

  const engineeringUsersCSV = operations.filter(
    csvMessage,
    (user) => operations.extractValue(user, 'department', FormatType.CSV) === 'Engineering',
    FormatType.CSV
  );
  console.log(`Filtered to ${operations.count(engineeringUsersCSV, FormatType.CSV)} engineering users`);

  console.log('\n3. Cross-Format Transformation');
  console.log('==============================');
  
  // Transform JSON to CSV format
  const transformedData = engine.transform(jsonData, FormatType.JSON, FormatType.CSV);
  console.log('Successfully transformed JSON data to CSV format');
  console.log(`Original format: ${jsonData.type}, Transformed format: ${transformedData.type}`);
  
  // Transform CSV to JSON format
  const backTransformed = engine.transform(csvData, FormatType.CSV, FormatType.JSON);
  console.log('Successfully transformed CSV data back to JSON format');
  console.log(`Original format: ${csvData.type}, Transformed format: ${backTransformed.type}`);

  console.log('\n4. Query Builder Example');
  console.log('========================');
  
  // Complex query using builder pattern
  const queryResult = operations
    .query(jsonMessage, FormatType.JSON)
    .filter((user) => operations.extractValue(user, 'active', FormatType.JSON) === true)
    .transform((user) => {
      // Add a computed field
      return {
        ...user,
        children: [
          ...(user.children || []),
          createFNode(FNodeType.FIELD, 'displayName', 
            operations.extractValue(user, 'name', FormatType.JSON) + ' (' + 
            operations.extractValue(user, 'department', FormatType.JSON) + ')')
        ]
      };
    })
    .sort((a, b) => {
      const nameA = operations.extractValue(a, 'name', FormatType.JSON);
      const nameB = operations.extractValue(b, 'name', FormatType.JSON);
      return nameA.localeCompare(nameB);
    })
    .execute();

  console.log(`Query result contains ${operations.count(queryResult, FormatType.JSON)} processed users`);

  console.log('\n5. Format Compatibility Check');
  console.log('=============================');
  
  const formats = [FormatType.JSON, FormatType.CSV, FormatType.XML];
  
  for (const source of formats) {
    for (const target of formats) {
      if (source !== target) {
        const compatible = engine.isCompatible(source, target);
        console.log(`${source} → ${target}: ${compatible ? 'Compatible' : 'Not compatible'}`);
      }
    }
  }

  console.log('\n=== Demo Complete ===');
  
  // Cleanup
  await resources.cleanup();
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSemanticOperations().catch(console.error);
}