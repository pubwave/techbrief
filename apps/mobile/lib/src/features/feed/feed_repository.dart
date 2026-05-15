import 'package:path/path.dart' as path;
import 'package:sqflite/sqflite.dart';

import 'feed_api_client.dart';
import 'feed_article.dart';

class FeedSyncResult {
  const FeedSyncResult({
    required this.savedArticles,
    required this.usedLocalCache,
    this.errorMessage,
  });

  final int savedArticles;
  final bool usedLocalCache;
  final String? errorMessage;
}

class FeedRepository {
  FeedRepository._();

  static final FeedRepository instance = FeedRepository._();

  Database? _database;

  Future<Database> get database async {
    final existing = _database;
    if (existing != null) {
      return existing;
    }

    final dbPath = path.join(await getDatabasesPath(), 'techbrief_mobile.db');
    final db = await openDatabase(
      dbPath,
      version: 2,
      onCreate: (database, version) async {
        await _createSchema(database);
      },
      onUpgrade: (database, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          await database.execute('DROP TABLE IF EXISTS articles');
          await _createSchema(database);
        }
      },
    );

    _database = db;
    return db;
  }

  Future<List<FeedArticle>> loadArticles() async {
    final db = await database;
    final rows = await db.query('articles', orderBy: 'published_at DESC');
    return rows.map(FeedArticle.fromMap).toList();
  }

  Future<FeedArticle?> loadArticle(String id) async {
    final db = await database;
    final rows = await db.query(
      'articles',
      where: 'id = ?',
      whereArgs: <Object>[id],
      limit: 1,
    );
    if (rows.isEmpty) {
      return null;
    }

    return FeedArticle.fromMap(rows.first);
  }

  Future<FeedSyncResult> syncFromServer(
    String apiBaseUrl,
    String language,
  ) async {
    try {
      final articles = await FeedApiClient(apiBaseUrl).fetchArticles(language);
      if (articles.isEmpty) {
        return const FeedSyncResult(
          savedArticles: 0,
          usedLocalCache: true,
          errorMessage: 'The server returned an empty feed.',
        );
      }

      final db = await database;
      await db.transaction((transaction) async {
        await transaction.delete('articles');
        final batch = transaction.batch();
        for (final article in articles) {
          batch.insert('articles', article.toMap());
        }
        await batch.commit(noResult: true);
      });

      return FeedSyncResult(
        savedArticles: articles.length,
        usedLocalCache: false,
      );
    } catch (error) {
      return FeedSyncResult(
        savedArticles: 0,
        usedLocalCache: true,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> _createSchema(Database database) async {
    await database.execute('''
      CREATE TABLE articles (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        source_name TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        body TEXT NOT NULL,
        published_at TEXT NOT NULL,
        original_url TEXT NOT NULL
      )
    ''');
  }
}
