import copy


def fill_dict(keys, value):
    """Create a dict with each key set to a deep copy of value."""
    result = {}
    for key in keys:
        result[key] = copy.deepcopy(value)
    return result

# Copied from https://codereview.stackexchange.com/a/131836


class EqHash:
    """Mixin adding __eq__, __ne__, and __hash__ methods."""

    def __eq__(self, other):
        return (self is other
                or (type(self) == type(other)
                    and vars(self) == vars(other)))

    def __ne__(self, other):
        return not (self == other)

    def __hash__(self):
        return hash(tuple(sorted(vars(self).items())))


class Repr:
    """Mixin adding a __repr__ method."""

    def __repr__(self):
        return '{name}({values})'.format(
            name=type(self).__name__,
            values=', '.join(map(repr, vars(self).values())))
