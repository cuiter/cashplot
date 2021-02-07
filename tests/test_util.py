from cashplot.util import *
import datetime


def test_fill_dict():
    d1 = fill_dict(['a', 'b'], 0)
    assert d1 == {'a': 0, 'b': 0}

    d2 = fill_dict(['very', 'nice'], [1, [2, 3]])
    assert d2 == {'very': [1, [2, 3]], 'nice': [1, [2, 3]]}

    # Test whether the value was deep-cloned for every key.
    d2['very'][1].pop()
    assert d2 == {'very': [1, [2]], 'nice': [1, [2, 3]]}


class Point(EqHash, Repr):
    def __init__(self, x, y):
        self.x = x
        self.y = y


def test_eq_hash():
    pt = Point(5, 2)
    assert pt == Point(5, 2)
    assert pt != 'hi'
    assert pt == pt
    assert hash(pt) == hash(pt)
    assert hash(pt) != hash(Point(6, 1))


def test_repr():
    assert repr(Point(5, 2)) == 'Point(5, 2)'
    assert repr(Point(-5, -2)) == 'Point(-5, -2)'


def test_interleave_lists():
    assert interleave_lists([1, 2], [3, 4]) == [1, 3, 2, 4]
    assert interleave_lists(['first', 'second'], ['third', 'fourth']) == ['first', 'third', 'second', 'fourth']
