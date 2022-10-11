import { InjectModel } from '@nestjs/sequelize';
import { Tweet } from '../entities/tweet.entity';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Cache } from 'cache-manager';

@Injectable()
export class TweetsCountService {
  private limit = 10;
  constructor(
    @InjectModel(Tweet)
    private tweetModel: typeof Tweet,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Interval(5000)
  async countWeet(): Promise<void> {
    console.log('Procurando tweets');
    let offset = await this.cacheManager.get<number>('offset');
    offset = offset === undefined ? 0 : offset;

    console.log(`offsets: ${offset}`);

    const tweets: Tweet[] = await this.tweetModel.findAll({
      offset,
      limit: this.limit,
    });

    if (tweets.length === this.limit) {
      await this.cacheManager.set('offset', offset + this.limit, 600);
      console.log('achou 10 tweets');
    }
  }
}
