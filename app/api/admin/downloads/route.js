import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('sm-academy');
    
    // Get download statistics
    const downloadStats = await db.collection('downloads').aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: 1 },
          uniqueNotes: { $addToSet: '$noteId' },
          todayDownloads: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$downloadedAt',
                    new Date(new Date().setHours(0, 0, 0, 0))
                  ]
                },
                1,
                0
              ]
            }
          },
          thisWeekDownloads: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$downloadedAt',
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]).toArray();

    // Get most downloaded notes
    const mostDownloaded = await db.collection('notes').aggregate([
      {
        $match: {
          downloadCount: { $exists: true, $gt: 0 }
        }
      },
      {
        $sort: { downloadCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          title: 1,
          subject: 1,
          topic: 1,
          downloadCount: 1,
          lastDownloaded: 1,
          createdAt: 1
        }
      }
    ]).toArray();

    // Get downloads by subject
    const downloadsBySubject = await db.collection('downloads').aggregate([
      {
        $group: {
          _id: '$subject',
          downloads: { $sum: 1 },
          uniqueNotes: { $addToSet: '$noteId' }
        }
      },
      {
        $project: {
          subject: '$_id',
          downloads: 1,
          uniqueNotesCount: { $size: '$uniqueNotes' }
        }
      },
      {
        $sort: { downloads: -1 }
      }
    ]).toArray();

    // Get recent downloads
    const recentDownloads = await db.collection('downloads').aggregate([
      {
        $sort: { downloadedAt: -1 }
      },
      {
        $limit: 20
      },
      {
        $project: {
          noteTitle: 1,
          subject: 1,
          topic: 1,
          downloadedAt: 1
        }
      }
    ]).toArray();

    // Get download trends (last 30 days)
    const downloadTrends = await db.collection('downloads').aggregate([
      {
        $match: {
          downloadedAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$downloadedAt'
            }
          },
          downloads: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]).toArray();

    const stats = downloadStats[0] || {
      totalDownloads: 0,
      uniqueNotes: [],
      todayDownloads: 0,
      thisWeekDownloads: 0
    };

    return NextResponse.json({
      stats: {
        ...stats,
        uniqueNotesCount: stats.uniqueNotes?.length || 0
      },
      mostDownloaded,
      downloadsBySubject,
      recentDownloads,
      downloadTrends
    });
  } catch (error) {
    console.error('Downloads fetch error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}