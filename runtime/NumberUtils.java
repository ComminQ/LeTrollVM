package runtime;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.util.concurrent.ThreadLocalRandom;

public class NumberUtils {

  private static final ThreadLocalRandom RANDOM = ThreadLocalRandom.current();
  private static final DecimalFormat D_FORMAT = new DecimalFormat("##.##");

  public static void assertGreater(int a, int b) {
    if (a > b) {
      throw new IllegalArgumentException("A must be less than B (a=" + a +
                                         ", b=" + b + ")");
    }
  }

  /**
   *
   * @param num The integer
   * @return the number
   */
  public static String intToRoman(int num) {
    int[] values = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    String[] romanLetters = {"M",  "CM", "D",  "CD", "C",  "XC", "L",
                             "XL", "X",  "IX", "V",  "IV", "I"};
    StringBuilder roman = new StringBuilder();
    for (int i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        num = num - values[i];
        roman.append(romanLetters[i]);
      }
    }

    return roman.toString();
  }

  public static void assertInRange(int min, int max, int a) {
    assertGreater(min, max);
    if (min > a || max < a) {
      throw new IllegalArgumentException(
          "A must be in range [min,max], (min=" + min + ", max=" + max +
          ", a=" + a + ")");
    }
  }

  public static long map(long x, long in_min, long in_max, long out_min,
                         long out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }

  public static float map(float x, float in_min, float in_max, float out_min,
                          float out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }

  public static double map(double x, double in_min, double in_max,
                           double out_min, double out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }

  public static float clamp(float val, float min, float max) {
    return Math.max(min, Math.min(max, val));
  }

  public static int clamp(int val, int min, int max) {
    return Math.max(min, Math.min(max, val));
  }

  public static String format(float val) { return D_FORMAT.format(val); }

  public static String format(double val) { return D_FORMAT.format(val); }

  public static String format(double value, int places) {
    if (places < 0)
      throw new IllegalArgumentException();

    BigDecimal bd = new BigDecimal(Double.toString(value));
    bd = bd.setScale(places, RoundingMode.HALF_UP);
    return bd.toPlainString();
  }

  public static int slowlog2(int val) {
    return (int)Math.floor((Math.log(val) / Math.log(2)));
  }

  public static int random(int min, int max) {
    return RANDOM.nextInt(min, max);
  }

  public static double random(double min, double max) {
    return min + Math.random() * (max - min);
  }

  public static int random(int max) { return RANDOM.nextInt(max); }

  public static float randomF() { return RANDOM.nextFloat(); }

  public static double randomD() { return RANDOM.nextDouble(); }

  public static int fastlog2(int bits) // returns 0 for bits=0
  {
    int log = 0;
    if ((bits & 0xffff0000) != 0) {
      bits >>>= 16;
      log = 16;
    }
    if (bits >= 256) {
      bits >>>= 8;
      log += 8;
    }
    if (bits >= 16) {
      bits >>>= 4;
      log += 4;
    }
    if (bits >= 4) {
      bits >>>= 2;
      log += 2;
    }
    return log + (bits >>> 1);
  }
}

